import sys
import os.path

import redis
import datetime
import time
import requests
import json

# redis client settings, none if default setup
client = redis.Redis(charset="utf-8", decode_responses=True)

def save_backdate(response,date):

    res = response.json()
    apiName = res['monitors'][0]['friendly_name']
    apiStatus = res['stat']
    apiPercentage = res['monitors'][0]['custom_uptime_ranges']
    dateId = date
    details = {
        'api':apiName,
        'status':apiStatus,
        'percentage':apiPercentage
    }
    client.hmset(dateId+apiName,details)
    client.bgsave()

def save_multiple(responses):

    for apiRes in responses:
        res = apiRes.json()
        apiName = res['monitors'][0]['friendly_name']
        apiStatus = res['stat']
        apiPercentage = res['monitors'][0]['custom_uptime_ranges']
        dateId = datetime.date.today().strftime("%m%d%Y")
        details = {
            'api':apiName,
            'status':apiStatus,
            'percentage':apiPercentage
        }
        client.hmset(dateId+apiName,details)
        client.bgsave()

def get_doc_or_create(date_apiname):
    # ex. 31022020mygene ddmmyyyyapiname
    res = client.hgetall(date_apiname)
    if res:
        return json.dumps(res)
    else:
        # If no doc found rety uptime for that date
        failed_apiname = ''.join([i for i in date_apiname if not i.isdigit()])
        failed_date = ''.join(c for c in date_apiname if c.isdigit())
        retry_uptime_for(failed_date,failed_apiname)

def get_key_for(apiname):
    apis={
        "mygene.info":'m142169-2fd3ec3375da41d76e77d604',
        "myvariant.info":'m776973331-492ae87d5b86bf6741009dbf',
        "mychem.info":'m780201416-03e5f5583f5e9a0cd392c68c'
    }
    for (key,val) in apis.items():
        if key.lower() == apiname.lower():
            return val

def retry_uptime_for(date,apiname):

    # print("RETRYING DATE", apiname)

    failed_date = str(int(time.mktime(datetime.datetime.strptime(date, "%m%d%Y").timetuple())))
    # print('failed date: ',failed_date)
    onedayback = datetime.datetime.strptime(date, "%m%d%Y") - datetime.timedelta(1)
    day_before_failed= onedayback.strftime("%s")
    # print('day before: ',day_before_failed)

    # range must be unix timestamp
    range = day_before_failed+'_'+failed_date
    # print(range)
    data ={
        'format':'json',
        'custom_uptime_ranges':range,
        'api_key': get_key_for(apiname)
    }
    res = requests.post('https://api.uptimerobot.com/v2/getMonitors', data = data)
    if res:
        save_backdate(res,date)
