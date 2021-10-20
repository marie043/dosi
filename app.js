//필요한 모듈을 요청한다.
var express = require('express');
var exec = require('child_process').exec;
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var mysql = require('mysql');
const { PythonShell } = require('python-shell');//파이썬 쉘 사용해서 파일 읽을 것

//필요한 변수 선언
var filename = 'dosi_img';
var filepath = 'images/';
var yoloCommand = 'C:/Users/Soyoung/Desktop/darknet-master/build/darknet/x64/darknet.exe detector test C:/Users/Soyoung/Desktop/darknet-master/build/darknet/x64/data/obj.data C:/Users/Soyoung/Desktop/darknet-master/build/darknet/x64/cfg/yolo-obj.cfg C:/Users/Soyoung/Desktop/darknet-master/build/darknet/x64/backup/yolo-obj_final.weights '

//서버를 만든다.
app = express();

//세팅을 한다.
app.set('view engine','jade');
app.set('views','views');
app.use(express.static('public'));
var storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null,'./images');
    },
    filename:function(req, file, cb){
        cb(null, file.originalname);
        filename = file.originalname;
    }
});
var upload = multer({storage: storage});


//라우팅을 한다.
app.get('/',function(req,res){
    res.render('home');
});
app.post('/answer', upload.single('image'), function(req, res){
    //앱 으로 부터 이미지 파일 받아야함. ->images파일에 생성됨
    //yolo가 실행됨
    exec(yoloCommand+filepath+filename, function(err,stdout,stderr){
        if(err){
            //YOLO 에서 에러가 일어난 경우
            console.log("YOLO err:"+err);
            res.send(`<html><body><h1>Yolo error!</h></body><html>`);
        }else{
            //에러가 없을 경우에 결과 읽어오기
            filepath = 'C:/HYUNDOSI/images/';   //파일 경로를 욜로 결과 파일의 경로로 변경
            var filename2 = filename.slice(0,filename.length-3)+'txt';  //결과txt파일의 이름을 저장
            fs.readFile(filepath+filename2,'utf-8',function(err,data){  //txt파일의 내용을 읽어옴
                if(err){
                    //파일을 읽어오기 실패 -> 욜로가 정상적으로 작동했는데 객체를 탐지 하지 못한 경우
                    console.log(err);
                    res.send('의류 객체를 찾을 수 없습니다!');
                }
                else{
                    //파일을 읽어오기 성고 -> 욜로가 객체를 탐지한 경우
                    //변수에 저장
                    var strArray = data.split('\n');    //읽어온 데이터를 줄바꿈을 기준으로 쪼갬
                    var code = strArray[0];             //첫번째 데이터는 YOLO 인덱스
                    var typename = strArray[1];         //두번째 데이터는 YOLO 인덱스 값
                    var typeCode = '';                  //원피스, 상의 아우터, 하의 중 어느것인지 저장할 변수
                    var colorCode = '';                 //색상코드를 저장할 변수
                    var color = '';                     //색상을 저장할 변수
                    var mood = '';
                    var length = '';
                    var pattern = '';
                    var sleeve = '';
                    var similarity = 0.0;
                    var form = '';
                    if(code.lenth<1){                   //원피스의 경우 1자리 숫자가 반환됨
                        typeCode += '0';
                        colorCode += code[0];
                    }
                    else{                               //원피스가 아닌경우 2자리 숫자가 반환됨
                        typeCode += code[0];
                        colorCode += code[1];
                    }
                    switch(colorCode){                  //컬러코드를 컬러로 바꾼다
                        case '0': color+='red';break;
                        case '1': color+='orange';break;
                        case '2': color+='yellow';break;
                        case '3': color+='green';break;
                        case '4': color+='blue';break;
                        case '5': color+='darkblue';break;
                        case '6': color+='purple';break;
                        case '7': color+='brown';break;
                        case '8': color+='black';break;
                        case '9': color+='white';break;
                    }
                    //옷의 카테고리는 typeCode에 옷의 색상은 colorCode에 저장됨 string type으로 저장했음에 유의!
                    //욜로가 사진을 처리함
                    //레스넷을 돌린다.
                   

                     //pytorch 모델 실행 부분
                    var options = {
                        //pythonPath: '',
                        scriptPath: './',
                        args: [req.file.filename]
                    };
                    PythonShell.run('main.py', options, function (err, results) {
                        if (err) throw err;
                        console.log(results);
                        res.send(results);
                    });                  

                    //데이터 베이스에서 검색
                    //디비는 마이에스큐엘
                    //mySQL과 연결한다.
                    //DB connection을만든다.
                    var connection = mysql.createConnection({
                        host : 'localhost',
                        user : 'dosi',
                        password : '0413',
                        database : 'clothes',
                        insecureAuth : true
                    });
                    connection.connect();
                    //쿼리문을 만든다.
                    var query = 'select data form '
                    switch(typeCode){
                        case '0': query+='dress';break;
                        case '1': query+='top';break;
                        case '2': query+='outerr';break;
                        case '3': query+='bottom';break;
                    }
                    query+=' where ';
                    query+='color=\''+color+'\' ';
                   
                    //query에 resNet모델의 결과를 추가한다.
                    //query에 조건 추가!!!!
                    if(typeCode=='0'){          //dress의 경우

                    }else if(typeCode=='1'){    //top의 경우

                    }else if(typeCode=='2'){    //outer의 경우

                    }else{                      //bottom의 경우

                    }
                    query += ';';
                    //query에 조건 추가!!!!
                    connection.query(query,function(err,result,feild){
                        if(err){
                            console.err('query 검색이 안됩니다.');
                            res.send('검색결과가 없습니다.');
                        }
                        else{
                            //검색 결과를 전송할 수 잇는 형태로 변환
                            //검색한결과를 앱으로 전송
                            res.send();
                        }
                    });
                    //DB와 커넥션을 끊는다.
                    connection.end();
                }
            });


        }  
    });
});                
app.listen(413,function(){
    console.log('server is listening #413 port');
});
//C:\Users\Soyoung\Documents\DosiServer\app.js 에 저장되어있음