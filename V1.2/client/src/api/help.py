from elasticsearch import Elasticsearch
from elasticsearch import helpers
import pandas as pd
import json


def template(title, parent, description, subPDF=[]):
    doc = {
        'title': title,
        'parent':  parent,
        'description': description,
        'pdfpath' : subPDF
    }
    return doc

def subPDF(title, path):
    doc = {
        'title': title,
        'path': path
    }
    return doc

# create hedaMenu index
es = Elasticsearch()

title = ['Aktuelles', 'sub11', 'sub12', 'sub13', 'sub111', 'sub112', 'sub121', 'sub122', 'Angebotspalette']
parent = ['', 'Aktuelles', 'Aktuelles', 'Aktuelles', 'sub11', 'sub11', 'sub12', 'sub12', '']
description = ['', '', '', 'Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen',
'Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen',
'Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen',
'Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen',
'Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen',
'Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen Hier k\u00f6nnte ihre beschreibung stehen']
subPDF = [[], [], [], [subPDF('Vertrag 1', 'ex06.pdf'), subPDF('Vertrag 2', '5-3.pdf')], [subPDF('Vertrag 1', 'ex06.pdf')], [subPDF('Vertrag 1', 'ex06.pdf'), subPDF('Vertrag 2', '5-3.pdf')],
        [subPDF('Vertrag 1', 'ex06.pdf')], [subPDF('Vertrag 1', 'ex06.pdf'), subPDF('Vertrag 2', '5-3.pdf')], [subPDF('Vertrag 1', 'ex06.pdf'),subPDF('Vertrag 2', '5-3.pdf')]]

body = []
for i, t in enumerate(title):
    print(i)
    body.append(template(title[i], parent[i], description[i], subPDF[i]))

actions = []
for i, t in enumerate(title):
    action = {
        '_index': 'heda_menu_index',
        '_type': 'heda_menu',
        '_source': body[i]
    }
    actions.append(action)

request_body = {
    "settings" : {
        "number_of_shards": 1,
        "number_of_replicas": 0
    }
}

es.indices.delete(index='heda_menu_index')
es.indices.delete(index='heda_content_index')
#es.indices.create(index='heda_menu_index', body=request_body)
#print('index created...')
#helpers.bulk(es, actions)
#es.bulk(index='heda_menu_index', body = actions, refresh = True)
print('index filled...')
