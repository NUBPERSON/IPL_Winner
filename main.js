const request=require('request');
const cheerio=require('cheerio');
const fs=require('fs');
const excel=require('excel4node');



const url="https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results";
request(url,cb);
function cb(err,code,data){
    if(err)
      console.log(err);
    else
       mainpage(data);  
}

function mainpage(data){
const selectorTool =cheerio.load(data);
let allarr=selectorTool('.match-score-block');


for(let i=0;i<allarr.length;i++){
//  for(let i=0;i<1;i++){
    let link=selectorTool(allarr[i]).find('a').attr('href');
     link=link.substring(27,link.length-18);
     let finallink="https://www.espncricinfo.com"+link+"full-scorecard";
     request(finallink,cb1);
}

}

function cb1(err,code,data){
   
    if(err)
      console.log(err);
     else
      scorecardpage(data); 
}
let teams=[];
let bowteams=[];
let cnt=0;
function scorecardpage(data){
    cnt++;
    let selectorTool=cheerio.load(data);
    let tablearr=selectorTool('.table.batsman tbody');
    let namearr=selectorTool('.event  .name');
   
   let empty="";
   for(let i=0;i<30;i++)
     empty+=" ";
  
    for(let i=0;i<tablearr.length;i++){
         
       let team_name=selectorTool(namearr[i]).text();
      

       let tablerowarr=selectorTool(tablearr[i]).find('tr');
       for(let j=0;j<tablerowarr.length-1;j=j+2){
           let len=40;
            
           let data=selectorTool(tablerowarr[j]).find('td');
           len-=selectorTool(data[0]).text().length;
           let blank="";
           for(let q=0;q<len;q++)
              blank+=" ";

           let player_name=selectorTool(data[0]).text() ;
           let player_score=selectorTool(data[2]).text();
           createhelp(teams,team_name,player_name,player_score); 
         
       }
      
     
    }
    if(cnt == 60){
    fs.writeFileSync('batsman.json',JSON.stringify(teams),'UTF-8');
     createexcelfile(teams);
   }
   
    
    let tablearr1=selectorTool('.table.bowler tbody');
  
    empty="";
   for(let i=0;i<30;i++)
     empty+=" ";
   //console.log("Bowler"+empty+ "wickets");
    for(let i=0;i<tablearr1.length;i++){
       let team_nam=selectorTool(namearr[ ((i+1)%2)]).text();
       let tablerowarr=selectorTool(tablearr1[i]).find('tr');
    
       for(let j=0;j<tablerowarr.length;j++){
        let len=40;
           let data=selectorTool(tablerowarr[j]).find('td');
           if(data.length>=4){
            len-=selectorTool(data[0]).text().length;
            let blank="";
            for(let q=0;q<len;q++)
               blank+=" ";
      // console.log( selectorTool(data[0]).text() +blank+ selectorTool(data[4]).text());
       let bowler_name=selectorTool(data[0]).text();
       let bowler_wickets=selectorTool(data[4]).text();
       createhelp2(bowteams,team_nam,bowler_name,bowler_wickets); 
    }
       }
       //console.log("");
    }
    if(cnt == 60){
    fs.writeFileSync('bowler.json',JSON.stringify(bowteams),'UTF-8');
    createexcelfile2(bowteams); 
   }
}

function createhelp(teams,team_name,player_name,player_score){
   let idx=-1; 
   for(let i=0;i<teams.length;i++){
          if(teams[i].teamName==team_name){
             idx=i;
             break;
          }
    }
    if(idx==-1){
    teams.push({
         'teamName':team_name,
         'players':[],
    });}
    for(let i=0;i<teams.length;i++){
      if(teams[i].teamName==team_name){
         idx=i;
         break;
      }
    }
    let idx2=-1; 
    for(let i=0;i<teams[idx].players.length;i++){
         if(teams[idx].players[i].PlayerName==player_name)
            {
               idx2=i;
               break;
            }
    }
    if(idx2==-1){
       teams[idx].players.push({
             'PlayerName':player_name,
             'PlayerScore':parseInt(player_score)
       });
    }
    else{
      let tot=parseInt(player_score)+ parseInt(teams[idx].players[idx2].PlayerScore);

       teams[idx].players[idx2].PlayerScore=tot;
    }


}

function createhelp2(bowteams,team_nam,bowler_name,bowler_wickets){
   let idx=-1; 
   for(let i=0;i<bowteams.length;i++){
          if(bowteams[i].teamNam==team_nam){
             idx=i;
             break;
          }
    }
    if(idx==-1){
    bowteams.push({
         'teamNam':team_nam,
         'players':[],
    });}
    for(let i=0;i<bowteams.length;i++){
      if(bowteams[i].teamNam==team_nam){
         idx=i;
         break;
      }
    }
    let idx2=-1; 
    for(let i=0;i<bowteams[idx].players.length;i++){
         if(bowteams[idx].players[i].BowlerName==bowler_name)
            {
               idx2=i;
               break;
            }
    }
    if(idx2==-1){
       bowteams[idx].players.push({
             'BowlerName':bowler_name,
             'BowlerWickets':parseInt(bowler_wickets)
       });
    }
    else{
      let tot=parseInt(bowler_wickets)+ parseInt(bowteams[idx].players[idx2].BowlerWickets);

       bowteams[idx].players[idx2].BowlerWickets=tot;
    }


}

function createexcelfile(teams){
    
     let wb = new excel.Workbook();
 for(let i=0;i<teams.length;i++){
          let ws = wb.addWorksheet(teams[i].teamName);
          ws.cell(1, 1).string('Player name');
          ws.cell(1,3).string('runs');
          for(let j=0;j<teams[i].players.length;j++){
             // console.log(teams[i].players[j].PlayerName);
              ws.cell(2+j,1).string(teams[i].players[j].PlayerName);
              ws.cell(2+j,3).string(teams[i].players[j].PlayerScore.toString());

          }

      }
    //  console.log("i am here");
      wb.write('Batsman.csv');
  
}

function createexcelfile2(bowteams){
    
   let wb = new excel.Workbook();
for(let i=0;i<bowteams.length;i++){
        let ws = wb.addWorksheet(teams[i].teamNam);
        ws.cell(1, 1).string('Bowler name');
        ws.cell(1,3).string('wickets');
        for(let j=0;j<bowteams[i].players.length;j++){
            //console.log(bowteams[i].players[j].BowlerName);
            ws.cell(2+j,1).string(bowteams[i].players[j].BowlerName);
            ws.cell(2+j,3).string(bowteams[i].players[j].BowlerWickets.toString());

        }

    }
  //  console.log("i am here");
    wb.write('Bowler.csv');

}