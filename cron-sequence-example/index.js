var Twit = require('twit');
var T = new Twit(require('./config.js'));
var moment = require('moment');
var openwhisk = require('openwhisk');


function checkDate(date){
    var now = moment(new Date());
    var lastTime = moment(now).subtract(5, 'minutes');
    if (moment(date).isBefore(lastTime)){
        return false;
    } else {
        return true;
    }
}

function main(params){ 
  var wsk = openwhisk();  
  var user = params.name || '@pigify';
  return new Promise((resolve, reject) => {    
    T.get('search/tweets', { q: user+' since:2017-01-01', count: 100 }, function(err, data, response) {
            if (err) {
                reject({payload: err})
            }
            else {
                data.statuses.map(function(status){
                    if (checkDate(status.created_at) === true) {
                        resolve(wsk.actions.invoke({
                            actionName: "/LB-testing-1_dev/ICLab/pigify",
                            params: {json:"{\"text\": \""+ status.text + "\",\"user\": {\"name\": \""+status.user.name+"\"}}"}
                        }))
                    }; 
                })
                resolve({payload: 'all tweets too old'});
            }    
        })
});
}
exports.main = main;