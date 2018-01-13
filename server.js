var express = require('express') ;
var app = express() ;
var server = require('http').createServer(app) ;
var io = require('socket.io').listen(server) ;
users = [] ;
connections = [] ;
totale = 0 ;
game = false ;
scores ={} ;
i= 0 ;
reponse ="" ;
cpt=0 ;
hint ="" ;
//lire les questions depuis le fichier JSON
var fs = require("fs");
// Get content from file
var contents = fs.readFileSync("questions.json");
// Define to JSON type
var jsonContent = JSON.parse(contents);


String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

server.listen(process.env.PORT || 3000) ;
console.log('server running ..') ;
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html') ;
});



io.sockets.on('connection',function(socket){
    if (users.length>=4) {
        socket.emit('game full' , {msg : 'Sorry game is full'}) ;
        console.log("full") ;
    }
    else 
    {
    connections.push(socket);
    console.log('Connected : %s sockets connected',connections.length) ;
    }

    if (i<=2) console.log('test') ;

    // Deconnection
    socket.on('disconnect',function (data) {
        if(!socket.username) return ;
        users.splice(users.indexOf(socket.username),1) ;
        updateUsernames() ;
        console.log(socket.username) ;
        socket.disconnect() ;
        totale-=1 ;
        connections.splice(connections.indexOf(socket),1) ;
        console.log('Disconnected: %s sockets connected' ,connections.length) ;
    });
    
    //player is ready 
    socket.on('ready',function(data){
        totale+=1 ;
        console.log(totale ) ;
        io.sockets.emit('ready ack' , {msg : data.name ,nb:totale}) ;
        console.log( data.name );
        if (totale == 4)
        {
                var counter = 100 ;
                intervalObj = setInterval(function(){
                if (counter <= 0 )  {
                    clearInterval(intervalObj);
                    game=true ;
                    io.sockets.emit('question' , {question : jsonContent[i].question ,answer: jsonContent[i].answer}) ;
                    for (j=0;j<jsonContent[i].answer.length;j++)
                    {
                        hint+='_' ;
                    }
                    used = new Array(jsonContent[i].answer.length).fill(0);
                    timer = 600 ;
                    intervalObj2 = setInterval(function(){
                        if (timer<=0 || reponse =="correct"){
                            clearInterval(intervalObj2);
                            used = new Array(jsonContent[i].answer.length).fill(0);
                            cpt=0 ;

                        }
                        timer-=1 ;
                        if (timer == 600-(600/jsonContent[i].answer.length)) {
                            io.sockets.emit('hint' , {hint : "It contains "+jsonContent[i].answer.length+" characters"}) ;
                            cpt+=2 ;
                        }
                        else if (timer == 600-(600/jsonContent[i].answer.length*cpt))
                        {
                            
                            pos = Math.floor((Math.random() * (jsonContent[i].answer.length-1)) + 0);
                            console.log(pos) ;
                            while (used[pos]==1)
                            {
                                pos = Math.floor((Math.random() * (jsonContent[i].answer.length-1)) + 0);
                            }
                            used[pos]==1 ;
                            hint = hint.substr(0, pos) + jsonContent[i].answer[pos] + hint.substr(pos + 1);
                            //hint.replaceAt(pos,jsonContent[i].answer[pos]) ;
                            io.sockets.emit('hint' , {hint : hint}) ;
                            cpt+=1 ;
                        }
                        
                        //console.log(timer) ;
                        io.sockets.emit('timer question' , {msg : timer}) ;
                    }, 100);

                }
                io.sockets.emit('start' ,{start : counter}) ;
                counter-=1 ;
                //console.log(counter) ;
            }, 100); 
        
                //setTimeout(function(){
                //console.log("send questions"); 
                //question = jsonContent[0].question ;
                //answer = jsonContent[0].answer ;
                
                //console.log("question:", jsonContent[0].question);
                //console.log("reponse:", jsonContent[0].answer);
            //}, 10000);
        }
        
    });

    //player is not ready 
    socket.on('not ready',function(data){
        totale-=1 ;
        io.sockets.emit('not ready ack' , {msg : data.name ,nb: totale}) ;
        console.log( data.name );
    });

    //Send Message 
    socket.on('send message' , function (data) {
        console.log(data) ;
        io.sockets.emit('new message' ,{msg : data, user: socket.username}) ;
        if (game == true)
        {
            if (data == jsonContent[i].answer )
            {
                reponse="correct" ;
                io.sockets.emit('answer' ,{msg : "Correct !", user: socket.username}) ; 
                scores[socket.username]+=timer/10 ;   
                i+=1 ;
                if (i<=16) { 
                updateUsernames() ;
                setTimeout(function(){
                    reponse="";
                    //clearInterval(intervalObj);
                    io.sockets.emit('question' , {question : jsonContent[i].question ,answer: jsonContent[i].answer}) ;
                    hint="" ;
                    for (j=0;j<jsonContent[i].answer.length;j++)
                    {
                        hint+='_' ;
                    }
                    timer = 600 ;
                    used = new Array(jsonContent[i].answer.length).fill(0);
                    intervalObj2 = setInterval(function(){
                        if (timer<=0 || reponse=="correct"){
                            clearInterval(intervalObj2);
                            used = new Array(jsonContent[i].answer.length).fill(0);
                            cpt=0 ;

                            i+=1 ;
                updateUsernames() ;
                setTimeout(function(){
                    reponse="";
                    //clearInterval(intervalObj);
                    io.sockets.emit('question' , {question : jsonContent[i].question ,answer: jsonContent[i].answer}) ;
                    hint="" ;
                    for (j=0;j<jsonContent[i].answer.length;j++)
                    {
                        hint+='_' ;
                    }
                    timer = 600 ;
                    used = new Array(jsonContent[i].answer.length).fill(0);
                    intervalObj2 = setInterval(function(){
                        if (timer<=0 || reponse=="correct"){
                            clearInterval(intervalObj2);
                            used = new Array(jsonContent[i].answer.length).fill(0);
                            cpt=0 ;

                            reponse="" ;
                            i+=1 ;
                            //updateUsernames() ;
                            setTimeout(function(){
                                reponse="";
                                //clearInterval(intervalObj);
                                io.sockets.emit('question' , {question : jsonContent[i].question ,answer: jsonContent[i].answer}) ;
                                hint="" ;
                                for (j=0;j<jsonContent[i].answer.length;j++)
                                {
                                    hint+='_' ;
                                }
                                timer = 600 ;
                                used = new Array(jsonContent[i].answer.length).fill(0);
                                intervalObj2 = setInterval(function(){
                                    if (timer<=0 || reponse=="correct"){
                                        clearInterval(intervalObj2);
                                        used = new Array(jsonContent[i].answer.length).fill(0);
                                        cpt=0 ;
            
                                        //console.log("test") ;
                                        /*setTimeout(function(){
                                        io.sockets.emit('question' , {question : jsonContent[i+1].question ,answer: jsonContent[i+1].answer}) ;
                                    }, 3000);*/
                                        
                                    }
                                    
                                    timer-=1 ;
                                    if (timer == 600-(600/jsonContent[i].answer.length)) {
                                        io.sockets.emit('hint' , {hint : "It contains "+jsonContent[i].answer.length+" characters"}) ;
                                        cpt+=2 ;
                                    }
                                    else if (timer == 600-(600/jsonContent[i].answer.length*cpt))
                                    {
                                        
                                        pos = Math.floor((Math.random() * (jsonContent[i].answer.length-1)) + 0);
                                        console.log(pos) ;
                                        while (used[pos]==1)
                                        {
                                            pos = Math.floor((Math.random() * (jsonContent[i].answer.length-1)) + 0);
                                        }
                                        used[pos]==1 ;
                                        //alert(hello.replaceAt(2, "!!")); 
                                        hint = hint.substr(0, pos) + jsonContent[i].answer[pos] + hint.substr(pos + 1);
                                        io.sockets.emit('hint' , {hint : hint}) ;
                                        cpt+=1 ;
                                    }
                                    
                                    //console.log(timer) ;
                                    io.sockets.emit('timer question' , {msg : timer}) ;
                                }, 100); 
                            }, 3000);
                            //console.log("test") ;
                            /*setTimeout(function(){
                            io.sockets.emit('question' , {question : jsonContent[i+1].question ,answer: jsonContent[i+1].answer}) ;
                        }, 3000);*/
                            
                        }
                        
                        timer-=1 ;
                        if (timer == 600-(600/jsonContent[i].answer.length)) {
                            io.sockets.emit('hint' , {hint : "It contains "+jsonContent[i].answer.length+" characters"}) ;
                            cpt+=2 ;
                        }
                        else if (timer == 600-(600/jsonContent[i].answer.length*cpt))
                        {
                            
                            pos = Math.floor((Math.random() * (jsonContent[i].answer.length-1)) + 0);
                            console.log(pos) ;
                            while (used[pos]==1)
                            {
                                pos = Math.floor((Math.random() * (jsonContent[i].answer.length-1)) + 0);
                            }
                            used[pos]==1 ;
                            //alert(hello.replaceAt(2, "!!")); 
                            hint = hint.substr(0, pos) + jsonContent[i].answer[pos] + hint.substr(pos + 1);
                            io.sockets.emit('hint' , {hint : hint}) ;
                            cpt+=1 ;
                        }
                        
                        //console.log(timer) ;
                        io.sockets.emit('timer question' , {msg : timer}) ;
                    }, 100); 
                }, 3000);


                            //console.log("test") ;
                            /*setTimeout(function(){
                            io.sockets.emit('question' , {question : jsonContent[i+1].question ,answer: jsonContent[i+1].answer}) ;
                        }, 3000);*/
                            
                        }
                        
                        timer-=1 ;
                        console.log(i) ;
                        if (timer == 600-(600/jsonContent[i].answer.length)) {
                            io.sockets.emit('hint' , {hint : "It contains "+jsonContent[i].answer.length+" characters"}) ;
                            cpt+=2 ;
                        }
                        else if (timer == 600-(600/jsonContent[i].answer.length*cpt))
                        {
                            
                            pos = Math.floor((Math.random() * (jsonContent[i].answer.length-1)) + 0);
                            console.log(pos) ;
                            while (used[pos]==1)
                            {
                                pos = Math.floor((Math.random() * (jsonContent[i].answer.length-1)) + 0);
                            }
                            used[pos]==1 ;
                            //alert(hello.replaceAt(2, "!!")); 
                            hint = hint.substr(0, pos) + jsonContent[i].answer[pos] + hint.substr(pos + 1);
                            io.sockets.emit('hint' , {hint : hint}) ;
                            cpt+=1 ;
                        }
                        
                        //console.log(timer) ;
                        io.sockets.emit('timer question' , {msg : timer}) ;
                    }, 100); 
                }, 3000);
               
            }  
            }
            else
            {
                io.sockets.emit('answer' ,{msg : "Wrong !", user: socket.username}) ;
                scores[socket.username]-=5 ;   
                updateUsernames() ;
            }

    }
        
    }) ;

    //new user 
    socket.on('new user',function (data,callback) {
        callback(true) ;
        socket.username = data ;
        socket.score=0 ;
        scores[socket.username] = 0 ;
        users.push(socket.username) ;
        updateUsernames() ;
    });

    function updateUsernames() {
        io.sockets.emit('get users', {users :users, scores : scores}) ;
        
    }
    

});