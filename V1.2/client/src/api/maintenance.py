from    flask           import Flask, jsonify, request, render_template
from    flask_cors      import CORS
from    werkzeug.utils  import secure_filename
from    loadMenu        import createTableEntry, getParents, getNestedMenu, getPath
from    nested_lookup   import nested_lookup
from    elasticsearch   import Elasticsearch

import  numpy as np
import  os
import  slate
import  time
import  unicodedata

# -*- coding: utf-8 -*-

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '../../.././pdfs'

# initialize
es = Elasticsearch([{'host':'localhost', 'port':9200}])

# menu index
MENU_INDEX = 'heda_menu_index'
# Pdf content index
CONTENT_INDEX = 'heda_content_index'


# fetch menu table from ElasticSearch
def fetchTable():
    # try if ElasticSearch reachable
    try:
         #  check if index exists, if not create index
        if es.indices.exists(index=MENU_INDEX):
            return es.search(index=MENU_INDEX, size=1000), True
        else: 
            request_body = {
                "settings" : {
                    "number_of_shards": 1,
                    "number_of_replicas": 0
                }
            }
            es.indices.create(index=MENU_INDEX, body=request_body)
            print('menu index created...')
            return es.search(index=MENU_INDEX, size=1000), True
    # If ElasticSearch not reachable
    except:
        return '', False

# check if file needs to be deleted
def isNeeded(_id, _pdfPath, pdfpathArray, i):
    # check if file is used somewhere else
    fileNeeded = False
    # fetch current menu
    menuIndex, _ = fetchTable()

    menuTable = []
    # sort index
    menuIndex = menuIndex['hits']['hits']
    for doc in menuIndex:
        parent = doc['_source']['parent']
        title = doc['_source']['title']
        _id = doc['_id']
        description = doc['_source']['description']
        pdfPath = doc['_source']['pdfpath']
        menuTable.append(createTableEntry(title, parent, _id, description, pdfPath, 0))

    # check all other
    for row in menuTable:
        if row['id']!=_id:
            for oldPdf in row['pdfpath']:
                if oldPdf['path']==_pdfPath:
                    fileNeeded = True
                else: pass

    # check self
    pdfs = []
    for pdf in pdfpathArray:
        pdfs.append(pdf['path'])
    indices = [index for index, value in enumerate(pdfs) if value==_pdfPath]
    print('Indices: ', indices)
    if len(indices)>1:
        for idx in indices:
            if (idx!=i)&(pdfpathArray[idx]['status']!='delete'):
                fileNeeded = True

    return fileNeeded

# Get menu table from EliasticSearch
@app.route('/getMenuTable')
def getMenuTable():
    menuIndex, status = fetchTable()
    if status:
        menuTable = []
        for key, doc in enumerate(menuIndex['hits']['hits']):
            parent = doc['_source']['parent']
            title = doc['_source']['title']
            _id = doc['_id']
            description = doc['_source']['description']
            pdfPath = doc['_source']['pdfpath']
            key = doc['_source']['key'] if 'key' in doc['_source'].keys() else key
            menuTable.append(createTableEntry(title, parent, _id, description, pdfPath, key))

        return jsonify({'status':True, 'data':menuTable})

    else:
        return jsonify({'status':False, 'data':[]})

# Get menu from ElasticSearch
@app.route('/getMenu')
def getMenu():
    menuIndex, status = fetchTable()
    if status:
        # parents = getParents(menuIndex)
        menu = getNestedMenu(menuIndex)
        menu.append({"path": "maintenance_heda", "id": "mainHeda"})

        return jsonify({'status':True, 'data':menu})
    
    else:
        return jsonify({'status':False, 'data':[]})

# Add new document to ElasticSearch
@app.route('/addRow', methods=['POST'])
def addDocument():
    # get new row
    newRow = request.get_json()

    data = {
        'title': newRow['title'],
        'parent': newRow['parent'],
        'description': newRow['description'],
        'pdfpath': newRow['pdfpath'],
        'key': newRow['key']
    }
    
    # add new row to es
    res=es.index(index=MENU_INDEX, doc_type='heda_menu', body=data, refresh='wait_for')

    data = {'job': 'Done', 'status': 201, 'id':res['_id']}

    return jsonify(data)

# Updates keys
@app.route('/updateKeys', methods=['POST'])
def updateKeys():
    keys = request.get_json()

    print(keys)

    for key, _id in enumerate(keys.keys()):
        res = es.update(index=MENU_INDEX, doc_type='heda_menu', id=_id, body={'doc':{'key':key}}, refresh='wait_for')

    data = {'job': 'Received', 'status': 201}

    return jsonify(data)

# Upload files
@app.route('/uploadPDF', methods=['POST'])
def uploadPDF():
    # check if folder exists
    if not os.path.isdir(UPLOAD_FOLDER):
        # if not create folder
        os.mkdir(UPLOAD_FOLDER)

    # get file
    file = request.files['file']
    
    # save file
    file.save(os.path.join(UPLOAD_FOLDER, file.filename))

    # response
    data = {'job': 'Done', 'status': 201}

    return jsonify(data)

# Handle save row
@app.route('/updateEditForm', methods=['POST'])
def updateEditForm():

    # fetch current Menu
    currentMenuTable, _ = fetchTable()
    # sort by key
    if len(currentMenuTable['hits']['hits']) != 0:
        currentMenuTableSorted = sorted(currentMenuTable['hits']['hits'], key=lambda x: x['_source']['key'])

    # get editForm
    updateEditForm = request.get_json()

    isNew = False
    if updateEditForm['id']=='':
        # add to database
        data = {
            'title': updateEditForm['title'],
            'parent': updateEditForm['parent'],
            'description': updateEditForm['description'],
            'pdfpath': [],
        }
    
        res = es.index(index=MENU_INDEX, doc_type='heda_menu', body=data, refresh='wait_for')
        updateEditForm['id'] = res['_id']

        isNew = True

    # new pdfpath array
    newPdfpath = []
    # pdfs to deal with
    index = 0
    for i, pdf in enumerate(updateEditForm['pdfpath']):
        # delete pdfs and pdf content
        if pdf['status']=='delete':

            # check if file is used somewhere else
            fileNeeded = isNeeded(updateEditForm['id'], pdf['path'], updateEditForm['pdfpath'], i)
            print('File Needed: ', fileNeeded)

            if not fileNeeded:
                # delete file
                os.remove(os.path.join(UPLOAD_FOLDER, pdf['path']))
                print('PDF ', pdf['path'], ' deleted!')
            else:
                print('PDF ', pdf['path'], ' has not been deleted since it is used somewhere else!')

            # delete pdf content anyways
            res = es.delete(index=CONTENT_INDEX, doc_type='heda_content', id=pdf['id'], refresh='wait_for')
            print('Content of PDF ', pdf['path'], ' deleted!')


        if pdf['status']=='new':
            # check if index exists, if not create one
            if not es.indices.exists(index=CONTENT_INDEX):
                request_body = {
                    "settings" : {
                        "number_of_shards": 1,
                        "number_of_replicas": 0
                    }
                }
                es.indices.create(index=CONTENT_INDEX, body=request_body)
                print('content index created...')
            

            # open file
            pdfpath = pdf['path']

            file = open(UPLOAD_FOLDER + '/' + pdfpath, 'rb')
            # pdf content
            pdfContent = slate.PDF(file)
            
            thisDoc = ''
            for page in pdfContent:
                thisDoc += page

            # get path
            path = getPath(currentMenuTable['hits']['hits'], updateEditForm['id'])

            print('Path: ', path)

            # write content to database
            data = {
                'title': pdf['title'],
                'path': path,
                'description': updateEditForm['description'],
                'endpageTitle': updateEditForm['title'],
                'content': thisDoc,
                'file': pdf['path'],
                'index': index
                }
            index += 1
                
            # add new row to es
            res = es.index(index=CONTENT_INDEX, doc_type='heda_content', body=data, refresh='wait_for')

            # appand to new pdfpath array
            newPdf = {
                'title': pdf['title'],
                'path': pdf['path'],
                'id': res['_id']
            }
            newPdfpath.append(newPdf)

            print('Content of PDF ', pdfpath, ' is saved!')

        
        if pdf['status']=='old':
            # update pdf since it might happen that description or parent did change
            # get path
            path = getPath(currentMenuTable['hits']['hits'], updateEditForm['id'])

            # get old pdf content
            oldPdf = es.get(index=CONTENT_INDEX, doc_type='heda_content', id=pdf['id'])

            data = {
                'title': pdf['title'],
                'path': path,
                'description': updateEditForm['description'],
                'endpageTitle': updateEditForm['title'],
                'content': oldPdf['_source']['content'],
                'file': pdf['path'],
                'index': index
                }
            
            index += 1

            # delete pdf content anyways
            res = es.update(index=CONTENT_INDEX, doc_type='heda_content', id=pdf['id'], body={'doc': data}, refresh='wait_for')

            # appand to old pdfpath array
            oldPdf = {
                'title': pdf['title'],
                'path': pdf['path'],
                'id': pdf['id']
            }

            newPdfpath.append(oldPdf)
    
    # save new pdfpath array now
    data = {
        'title': updateEditForm['title'],
        'parent': updateEditForm['parent'],
        'description': updateEditForm['description'],
        'key': updateEditForm['key'],
        'pdfpath': newPdfpath
    }

    # update ElasticSearch
    res = es.update(index=MENU_INDEX, doc_type='heda_menu', id=updateEditForm['id'], body={'doc': data}, refresh='wait_for')

    print('New PDFs: ', newPdfpath)

    
    # get new index
    # fetch current Menu
    currentMenuTableNew, _ = fetchTable()
    # get path
    path = getPath(currentMenuTableNew['hits']['hits'], updateEditForm['id'])
    print('path: ', path)
    # update paths in heda_content_index of new pdfs
    for pdf in newPdfpath:
        res = es.update(index=CONTENT_INDEX, doc_type='heda_content', id=pdf['id'], body={'doc':{'path': path}}, refresh='wait_for')


    # sort now
    if len(currentMenuTable['hits']['hits']) != 0:
        # if new
        if isNew:
            # get parent
            parent = updateEditForm['parent']

            # find number of rows with same parents
            numberOfSameParents = 0
            for row in currentMenuTableSorted:
                if parent==row['_source']['parent']:
                    numberOfSameParents +=1
            
            print('Number of rows with same parent: ', numberOfSameParents)

            # find first row with same parent
            indexFirstBrother = 0
            for i, row in enumerate(currentMenuTableSorted):
                if parent==row['_source']['parent']:
                    indexFirstBrother = i
                    break
                if (i+1)==len(currentMenuTableSorted):
                    indexFirstBrother = i+1
            
            # key of new row
            newRowsIndex = indexFirstBrother + numberOfSameParents
            print('NEW add at index: ', newRowsIndex)
            es.update(index=MENU_INDEX, doc_type='heda_menu', id=updateEditForm['id'], body={'doc':{'key':newRowsIndex}}, refresh='wait_for')

            
            # adjust all other indices
            for row in currentMenuTableSorted:
                if row['_source']['key'] >= newRowsIndex:
                    es.update(index=MENU_INDEX, doc_type='heda_menu', id=row['_id'], body={'doc':{'key':row['_source']['key']+1}}, refresh='wait_for')
        
        # if not new but update
        else:
            parent = None
            for row in currentMenuTableSorted:
                if row['_id']==updateEditForm['id']:
                    parent = row['_source']['parent']

            if updateEditForm['parent']!=parent:
                # sort
                # find number of rows with same parents
                numberOfSameParents = 0
                for row in currentMenuTableSorted:
                    if parent==row['_source']['parent']:
                        numberOfSameParents +=1
                # find first row with same parent
                indexFirstBrother = 0
                for i, row in enumerate(currentMenuTableSorted):
                    if parent==row['_source']['parent']:
                        indexFirstBrother = i
                        break
                    if (i+1)==len(currentMenuTableSorted):
                        indexFirstBrother = i+1

                # new key
                rowsIndex = indexFirstBrother + numberOfSameParents

                # adjust all other indices
                for row in currentMenuTableSorted:
                    if row['_source']['key'] >= rowsIndex:
                        es.update(index=MENU_INDEX, doc_type='heda_menu', id=row['_id'], body={'doc':{'key':row['_source']['key']+1}}, refresh='wait_for')
    else:
        es.update(index=MENU_INDEX, doc_type='heda_menu', id=updateEditForm['id'], body={'doc':{'key':0}}, refresh='wait_for')

    print('NEW ROW ', data)

    # response
    response = {'job': 'Done', 'status': 201}

    return jsonify(response)

# Handle delete row
@app.route('/deleteRow', methods=['POST'])
def deleteDocument():

    # get row to delete
    deleteRow = request.get_json()

    # set status to delete
    for pdf in deleteRow['pdfpath']:
        pdf['status'] = 'delete'

    # delete pdfs
    for i, pdf in enumerate(deleteRow['pdfpath']):
        
        # check if file is used somewhere else
        fileNeeded = isNeeded(deleteRow['id'], pdf['path'], deleteRow['pdfpath'], i)

        if not fileNeeded:
            # delete file
            os.remove(os.path.join(UPLOAD_FOLDER, pdf['path']))
            print('PDF ', pdf['path'], ' deleted!')
        else:
            print('PDF ', pdf['path'], ' has not been deleted since it is used somewhere else!')


        # delete pdf content anyways
        res = es.delete(index=CONTENT_INDEX, doc_type='heda_content', id=pdf['id'], refresh='wait_for')
        print('Content of PDF ', pdf['path'], ' deleted!')
        

    # delete row
    res = es.delete(index=MENU_INDEX, doc_type='heda_menu', id=deleteRow['id'], refresh='wait_for')
    print('Row deleted!')

    # response
    response = {'job': 'Done', 'status': 201}

    return jsonify(response)

@app.route('/search', methods=['POST'])
def search():

    # string to search for
    searchKey = request.get_json()

    query = {
            "query": {
                "multi_match": {
                "query": searchKey,
                "fields": [ "title^2", "description^1.5", "content^1.5"] 
                }
                }
            }   

    # search 
    searchResult = es.search(index=CONTENT_INDEX, body=query)

    # hits
    hits = searchResult['hits']['hits']

    response = []
    for i, hit in enumerate(hits):
        response.append({
            'score': hit['_score'],
            'title': hit['_source']['title'],
            'path': hit['_source']['path'],
            'description': hit['_source']['description'],
            'file': hit['_source']['file'],
            'id': hit['_id'],
            'endpageTitle': hit['_source']['endpageTitle'],
            'index': hit['_source']['index']
        })
    # send result
    return jsonify({'result': response})

if __name__ == "__main__":
    app.run()
