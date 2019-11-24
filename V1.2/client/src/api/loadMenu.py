import numpy as np
# Create JSON Array from fetched array
def createNewEntry(path, title, _id, description, pdfArray, submenu, key):
    newJSON = {"values": {"title":title, "path":path, "id":_id, "description":description, "pdfpath":pdfArray, "key":key}, "submenu":submenu}
    return newJSON


def createTableEntry(title, parent, _id, description, pdfpath, key):
    return {"title":title, "parent":parent, "id":_id, "description":description, "pdfpath":pdfpath, "key":key}


def getParents(index):
    # create parents
    parents = []
    for doc in index['hits']['hits']:
        try:
            parents.append(doc['_source']['parent'])
        except: pass
        
    return parents


def getNestedMenu(index):
    # get unique parents
    parents = getParents(index)

    # get menu
    menu = createSub(index['hits']['hits'], [], parents)

    return menu
    

def createSub(index, jsonArray, parents, parent='', path=''):

    childIdx = [i for i, x in enumerate(parents) if x == parent]
    for i in childIdx:
        doc = index[i]
        parent = doc['_source']['parent']
        title = doc['_source']['title']
        _id = doc['_id']
        description = doc['_source']['description']
        pdfPath = doc['_source']['pdfpath']
        key = doc['_source']['key'] if 'key' in doc['_source'].keys() else i

        if path == "": pathChild = title
        else: pathChild = path + "/" + title
        
        if parents.count(_id) == 0:
            jsonArray.append(createNewEntry(pathChild , title, _id, description, pdfPath, [], key))
            
        else:
            jsonArray.append(createNewEntry(pathChild, title, _id, description, pdfPath, createSub(index, [], parents, _id, pathChild), key))
            
    return jsonArray


def getPath(index, _id):

    title = ''
    parent = ''
    for doc in index:
        if doc['_id']==_id:
            title = doc['_source']['title']
            parent = doc['_source']['parent']

    path = title
    runningParent = parent
    while runningParent != '':
        for row in index:
            if row['_id'] == runningParent:
                path = row['_source']['title'] + '/' + path
                runningParent = row['_source']['parent']
    
    return path