require('dotenv-extended').load();

//loading modules
var express = require("express");
var restify = require("restify");
var botbuilder = require("botbuilder");
var request = require("request-promise");
var mongoose = require('mongoose');
var User = require('./models/user');
var News = require('./models/news');


mongoose.connect("mongodb://backendeveloper:kafa1500@ds113738.mlab.com:13738/newseeys", {
    useMongoClient: true
});

mongoose.connection.on('error', function() {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

mongoose.connection.once('open', function() {
    console.log("Successfully connected to the database");
})

//create an express server
var app = express();
var port = process.env.port || process.env.PORT || 3978;
app.listen(port, function () {
    console.log('%s listening in port %s', app.name, port);
});
// mongoClient.connect('mongodb://previousdeveloper:Walter33@@ds113738.mlab.com:13738/newseeys', (err, database) => {
//     if (err) return console.log(err)
//     db = database
//     // app.listen(port, function () {
//     //     console.log('%s listening in port %s', app.name, port);
//     // });
//   });

//create a chat connector for the bot
var connector = new botbuilder.ChatConnector({
    appId: "051dd590-4630-4dc4-9635-f26718600a09",
    appPassword: "gqbycqAXB299[[)gNNKQ24}"
});

//load the botbuilder classes and build a unversal bot using the chat connector
var bot = new botbuilder.UniversalBot(connector);

//hook up bot endpoint
app.post("/api/messages", connector.listen());

var nextQuestion = function (session) {
    var msg = new botbuilder.Message(session).sourceEvent({
        facebook: {
            text: "Make your choose",
            quick_replies:[
                        {
                            content_type: "text",
                            title:" Detay",
                            payload: "details"
                        },
                        {
                            content_type: "text",
                            title: "Devam",
                            payload: "next"
                        }
                    ]
                }
            });
    session.endDialog(msg);
};

//root dialog
bot.dialog("/", function (session) {
    if (session.message.address.channelId === "facebook") {
        session.sendTyping();
        User.findOne({ userid: session.message.user.id }, function(err, user) {
            if (user == null) {                                   
                addUser(session);
                session.send("Hos Geldiniz"); 
                conversation(session, user);
                // en bastan o gunun haberlerini cek
                nextQuestion(session);
              } else {
                conversation(session, user);


                if (session.message.text == "details") {
                    session.send("Zeytin Dalı Harekatı kapsamındaki gelişmeleri izlemek üzere sınır hattında bulunan yabancı medya kuruluşlarının talebi üzerine Azez ve çevresine gezi düzenlendi");
                    session.sendTyping();
                    session.send("Bu kapsamda ilk durak Burseya Dağı eteklerindeki mevziler oldu. Güvenlik nedeniyle gazetecileri belirli bir noktaya kadar ulaştırdıktan sonra yerel polis gücüyle röportaj çalışması yapıldığı sırada, bir bölümü terör örgütü PYD/PKK mensuplarının işgalindeki alandan taciz atışı gerçekleştirildi");
                    session.sendTyping();
                    session.send("Olayda yaralanan olmazken, konvoyun güvenliğini sağlayan kobra tipi aracın lastiği patladı");
                    session.sendTyping();            
                    nextQuestion(session);
                } else if (session.message.text == "next") {
                    session.send("Sonraki haber geliyor");
                    session.sendTyping();
                    session.send("Dışişleri Bakanı Çavuşoğlu: Bittiği yere kadar gideceğiz");
                    session.sendTyping();
                    nextQuestion(session);
                } else {
                    nextQuestion(session);
                } 
              }
            });      
        
    } else session.send("Facebookta degilsin!");

    
});

var conversation = function (session, users) {
        var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() -1);
        // db.getCollection('news').find({
        // "PublishDate" : {"$gte": currentDate,
        //         "$lt": new Date()}
        // })
        News.find({}).where('PublishDate').gte(currentDate).lt(new Date()).exec(function(err, newsList) {
            if (err) throw err;
            for(i = 0; i < 5; i++){
                session.send(newsList[i].Text);
                nextQuestion(session);
            }
            console.log(newsList);
          });
        // News.find({ "PublishDate" : {"$gte": currentDate, "$lt": new Date()} , function(err, newsList) {
        //     if (err) throw err;
        //     console.log(newsList);
        //     for(i = 0; i < 5; i++){
        //         session.send(newsList[i]);
        //     }
        //     session.send(newsList);
          
        //     // show the admins in the past month
            
        //     }
        //   });
}


var addUser = function (session) {
    if (session != null) {
        var model = new User({
            userid: session.message.user.id,
            username: session.message.user.name,
            channelname: "Facebook",
            readednewsnumber: 0
        });
        model.save(function (err, data) {
            if (err) throw err;
        });
    }   
}

var addNews = function () {
    var model = new News({
        Text: "TSK'dan Afrin açıklaması: 73 terörist etkisiz hale getirildi",
        CreatedDate: new Date(),
        UpdatedDate: null,
        PublishDate: new Date(),
        Contents: [{
            Text: "Genelkurmay Başkanlığından yapılan açıklamada, Türk Silahlı Kuvvetlerince (TSK) hudutlarda ve bölgede güvenlik ve istikrarı sağlamak amacıyla Suriye'nin kuzeybatısında Afrin bölgesinde, PKK/KCK/PYD-YPG ve DEAŞ'a mensup teröristleri etkisiz hale getirmek, dost ve kardeş bölge halkını terör örgütü üyelerinin baskı ve zulmünden kurtarmak üzere 20 Ocak saat 17.00'de Zeytin Dalı Harekatı'nın başlatıldığı hatırlatıldı.",
            CreatedDate: new Date(),
            PublishDate: new Date(),
            OrderNumber: 1
        },
        {
            Text: "Harekatın planlandığı şekilde devam ettiği belirtilen açıklamada, harekatın Türkiye'nin uluslararası hukuktan kaynaklanan hakları, Birleşmiş Milletler Güvenlik Konseyi'nin (BMGK) terörle mücadeleye ilişkin kararlarıyla, BM sözleşmesinin 51'inci maddesinde yer alan meşru müdafaa hakkı çerçevesinde, Suriye'nin toprak bütünlüğüne saygılı olarak icra edildiği vurgulandı.",
            CreatedDate: new Date(),
            PublishDate: new Date(),
            OrderNumber: 2
        },
        {
            Text: "Harekatın planlama ve icrasında, sadece teröristlerin ve onlara ait barınak, sığınak, mevzii, silah, araç ve gereçlerin hedef alındığı ifade edilen açıklamada, sivil/masum kişilerin ve çevrenin zarar görmemesi için her türlü dikkat ve hassasiyetin gösterildiğinin altı çizildi.",
            CreatedDate: new Date(),
            PublishDate: new Date(),
            OrderNumber: 3
        },
        {
            Text: "PKK/KCK/PYD-YPG ve DEAŞ terör örgütü unsurları ile girilen çatışmalarda bugün Türk Silahlı Kuvvetlerinden hayati tehlikesi olmayacak",
            CreatedDate: new Date(),
            PublishDate: new Date(),
            OrderNumber: 4
        },
        {
            Text: "Açıklamada, bir Özgür Suriye Ordusu (ÖSO) mensubunun şehit olduğu, hayati tehlikesi olmayacak şekilde dört ÖSO mensubunun da yaralandığı bildirildi",
            CreatedDate: new Date(),
            PublishDate: new Date(),
            OrderNumber: 5
        }
    ]
    });
    model.save(function (err, data) {
        if (err) throw err;
        console.log(data);
    });
}


