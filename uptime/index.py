import sys
import os.path

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.escape
from tornado.httpclient import AsyncHTTPClient
from tornado.options import define, options
from apscheduler.schedulers.tornado import TornadoScheduler
from jinja2 import Environment, FileSystemLoader
import redis
import requests
import asyncio
import datetime
import json

# redis client settings, none if default setup
client = redis.Redis(charset="utf-8", decode_responses=True)

import rediscontrol as rediscontrol

root = os.path.dirname(__file__)

define("port", default=8000, help="run on the given port", type=int)
define("address", default="127.0.0.1", help="run on localhost")
define("debug", default=False, type=bool, help="run in debug mode")
tornado.options.parse_command_line()
if options.debug:
    import logging
    logging.getLogger().setLevel(logging.DEBUG)
    options.address = '0.0.0.0'

class BaseHandler(tornado.web.RequestHandler):
    def return_json(self, data):
        _json_data = json_encode(data)
        self.set_header("Content-Type", "application/json; charset=UTF-8")
        self.write(_json_data)

class MainHandler(BaseHandler):
    def get(self):
        self.render('index.html')

class DateHandler(BaseHandler):

    # print("*******DATE HANDLER ****")

    def get(self,dateapi):
        res = client.hgetall(dateapi)
        # print("RES")
        # print(res)
        if res:
            self.write(json.dumps(res))
        else:
            datestring = ''.join(c for c in dateapi if c.isdigit())
            past = datetime.datetime.strptime(datestring, "%m%d%Y")
            present = datetime.datetime.now()

            if  present.date() > past.date():
                # print("past ________ ",past.date())
                # print("present ________ ",present.date())
                # try to get api uptime for failed date
                retry = rediscontrol.get_doc_or_create(dateapi)
                if retry:
                    self.write(json.dumps(retry))
                else:
                    self.send_error(
                        reason="Uptime not available for date/api",
                        status_code=404)
            else:
                self.send_error(
                    reason="Uptime not available for date/api",
                    status_code=404)



    def post(self):

        args = json_decode(self.request.body)

        assert 'api' in args, "api name must be provided"
        assert 'date' in args, "date must be provided and in MMDDYYYY format"

        date = args['date']
        api = args['api']

        res = client.hgetall(date+api)
        if res:
            self.write(json.dumps(res))
        else:
            self.send_error(
                reason="uptime not available for date/api",
                status_code=404)
            return


APP_LIST = [
    # (r"/(.*)", tornado.web.StaticFileHandler, {"path": root, "default_filename": "index.html"}),
    (r"/", MainHandler),
    (r"/date-status/?", DateHandler),
    (r"/date-status/(.+)/?", DateHandler),
]

settings = {
    # "cookie_secret": config.COOKIE_SECRET
}

if options.debug:
    settings.update({
        # "static_path": STATIC_PATH,
        "debug": True
    })

async def get_uptime_for_day(api,api_key):
    t = datetime.date.today()
    today = t.strftime("%s")
    y = datetime.date.today() - datetime.timedelta(1)
    yesterday= y.strftime("%s")
    range = yesterday+'_'+today
    print(range)
    data ={
        'format':'json',
        'custom_uptime_ranges':range,
        'api_key': api_key
    }
    res = requests.post('https://api.uptimerobot.com/v2/getMonitors', data = data)
    if res:
        return res

async def get_tasks():
    tasks=[]
    api_keys={
        "myGene":'m142169-2fd3ec3375da41d76e77d604',
        "myVariant":'m776973331-492ae87d5b86bf6741009dbf',
        "myChem":'m780201416-03e5f5583f5e9a0cd392c68c'
    }
    for key,value in api_keys.items():
        tasks.append(asyncio.ensure_future(get_uptime_for_day(key,value)))
    allResponses = await asyncio.gather(*tasks)
    if allResponses:
        rediscontrol.save_multiple(allResponses)

def daily_job():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(get_tasks())
    loop.close()

def schedule_daily_job():
    sched = TornadoScheduler()
    sched.add_job(daily_job, 'interval', days=1)
    sched.start()

def main():
    schedule_daily_job()
    application = tornado.web.Application(APP_LIST, **settings)
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port, address=options.address)
    loop = tornado.ioloop.IOLoop.instance()
    if options.debug:
        # tornado.autoreload.start(loop)
        logging.info('Server is running on "%s:%s"...' % (options.address, options.port))
    loop.start()

if __name__ == "__main__":
    main()
