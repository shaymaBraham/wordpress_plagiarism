

jQuery(document).ready(function($) {


 if(script_vars.user.length)
 {
  
  $users=script_vars.user;
   $user=$users[0]

  $UserID=$user.id
  $UserToken=$user.token


   $.ajax({

                url: "https://logicielantiplagiat.fr/check/api/checkuser",

                type: 'post',

                data:{
                         token:   $UserToken ,
                         

                      },
                 success: function (resp) {

                  let res=$.parseJSON(resp);

                  $('#quota').html(res.DAILY_CHECK_COUNT)
                  $('#tokenu').html($UserToken)
                  $('#name').html(res.user.name)
                  $('#email').html(res.user.email)
            

                 } ,
                 error: function(){

            }

          });
 }

 

  jQuery('#rapportsTab').DataTable({
    order : false,

  });

  jQuery('#auto-table').DataTable({
    order : false,
    
  });

//$('.dataTables_length').addClass('bs-select');


function stripHtml(html)
{
   let tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}
$('#checkPlagia').on('click',function(e){

e.preventDefault()
const { select } = wp.data;
//console.log("icii check",wp.data.select( 'core/block-editor' ).getSelectedBlock() )
//const title = select("core/editor").getEditedPostAttribute( 'title' );
//const content = select("core/editor").getEditedPostAttribute( 'content' );

let title=''
let content=''

   	  const jsObjects=$('form#post').serializeArray()
                //console.log(jsObjects)
                let result = jsObjects.filter(obj => {
                   if(obj.name === 'content')
                   {
                       content=obj.value
                     }

                     if(obj.name === 'post_title')
                   {
                       title=obj.value
                     }
                   })
        if( content != '')
        {
          let $text=title+' '+stripHtml(content);      
  
        let mode=$('input[name="mode"]:checked').val();

          console.log("icii check",mode)

           Check(mode,$text)  
        }
        else
        {


          Swal.fire({
              title: 'Erreur!',
              text: 'Le titre ou le contenu de post sont vides ! ',
              icon: 'error',
              confirmButtonText: 'Compris'
             })
        }
            
        

        

   })

   function Check(mode,text)
   {
       let id_rapport;
          let mode_req;

          let reference;
       
        //console.log($user.pays, $user.langue) 
      $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_add_rapport',
                         mode:mode,
                         text: text,
                         postID:$('#post_id').val()

                      },
                 success: function (resp) {
            
                    console.log('success ajout rapport',resp)

                      id_rapport=$.parseJSON(resp).id;
                      reference=$.parseJSON(resp).ref;

                      let loader='<button class="btn btn-primary">'
                          loader+='<span class="spinner-border spinner-border-sm"></span>'
                          loader+=' vérification en cours ..</button>'

                      $('#btn_check_div').html(loader)

          if(mode==0){

          mode_req='live';


            var request = $.ajax(

            {

                url: "https://logicielantiplagiat.fr/check/api",

                type: 'post',

                data:{
                         token:    $UserToken ,
                         text:     text,
                         pays:     $user.pays,
                         langue:   $user.langue,
                         mode:     'live',

                      }

             });




            request.done(function(reponse)

            {
                  
                    console.log('Done ',id_rapport,reponse)
                     result=reponse;
                  
                   let bloc_rep=''
                   if(mode==0){


               $.ajax({

                      url: ajax_url,

                      type: 'POST',

                         data:{
                         action: 'plagia_update_rapport',
                         id:id_rapport,
                         response:reponse,
                         

                      },
                 success: function (data) {
            
                    if(result.success==1){


       

                     bloc_rep += '<H2 style="font-weight:bold;font-size:19px;color:'+getColor(result.unique)+'>'+result.unique+'% unique</H2>'
                        bloc_rep += '<table  class="table table-bordered" >';
                        bloc_rep += '<thead><tr>';
                        bloc_rep += '<th>Results</th>';
                        bloc_rep += '<th>Query</th>';
                        bloc_rep += '<th>Domains</th>';
                        bloc_rep += '</tr>';
                        bloc_rep += '</thead>';
                        bloc_rep += '<tbody>';

                        $.each(result.results, function(k,v)
                          {
                            bloc_rep+="<tr>";
                            bloc_rep+="<td id='result_"+k+"'>"+v.nb+"</td>";
                            bloc_rep+="<td id='query_"+k+"'><a target='_blank' href='"+v.url_req+"'>"+v.req+"</a></td>";

                            bloc_rep+="<td id='domains_"+k+"'>"
                             $.each(v.domains, function(c,d){
                              bloc_rep+="<a target='_blank' href='"+d.url+"'>"+d.domain+"</a><br>"
                             });
                            bloc_rep+="</td>";
                            bloc_rep+="</tr>";
                                       
                          });

                        bloc_rep+='</tbody></table>'
                   }
                   else{

                     bloc_rep+='<div class="alert alert-danger" role="alert">'
                     bloc_rep+='Erreur'
                      bloc_rep+='</div>';
                   }

                   $('#response').html(bloc_rep);


                      let btn_rechek='<button id="checkPlagia"  class="btn btn-primary">Vérifier le contenu dupliqué</button>'
                    

                      $('#btn_check_div').html(btn_rechek)
                    
                },
                 error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call, itself, failed, e.g., a syntax error
                // in your_function()
                alert ('Request failed: ' + thrownError.message) ;
                      },
                       }) ;
                       
                   }
                   
                   
                       
                            //console.log(bloc_rep)
                            

            });

            request.fail(function( jqXHR, textStatus ) 

           {
  
                  console.log('Fail api live') 


                           



           });
         }
         else{
           mode_req='post';
            var request = $.ajax(

            {

                url: "https://logicielantiplagiat.fr/check/api",

                type: 'post',

                data:{
                         token:    $UserToken ,
                         text:     text,
                         pays:     $user.pays,
                         langue:   $user.langue,
                         mode:     'post',
                         ref:  id_rapport,
                         domain : $user.domaine,
                         postback_url: 'http://wp.insightful.pro/wp-content/plugins/plagia/post_mode.php'

                      },
                      success:function(reponse)

                   {
                  
                    console.log('Doneee ',reponse)

                    bloc_rep='<div class="alert alert-success" role="alert">'
                     bloc_rep+='Contenu envoyé pour etre traité verifier le rapport de réference : '+ reference
                      bloc_rep+='</div>';
                   

                   $('#response').html(bloc_rep);
                    let btn_rechek='<button id="checkPlagia"  class="btn btn-primary">Vérifier le contenu dupliqué</button>'
                    

                      $('#btn_check_div').html(btn_rechek)

                  },
                  fail:function(err)
                  {
                     let bloc_rep='<div class="alert alert-danger" role="alert">'
                     bloc_rep+='Erreur'
                      bloc_rep+='</div>';
                  

                   $('#response').html(bloc_rep);


                      let btn_rechek='<button id="checkPlagia"  class="btn btn-primary">Vérifier le contenu dupliqué</button>'
                    

                      $('#btn_check_div').html(btn_rechek)
                  }
                     

             });
         }



                    
                },
                 error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call, itself, failed, e.g., a syntax error
                // in your_function()
                alert ('Request failed: ' + thrownError.message) ;
                },
            }) ;// fin add rapport
            
   }

   $(".modal").on("hidden.bs.modal", function(){
    $("#textModal").html("");
});
$('.exportPDF').on('click',function(){
let id_rapp=$(this).attr('data-id');
     $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_pdf',
                         rapp_id:id_rapp
                        

                      },
                 success: function (data) {
                  console.log('icipdf',data)

                   let text=$.trim(data)
                    text= text.slice(0, -1)
            var downloadLink;
                downloadLink = document.createElement("a");
                downloadLink.download = "rapport_"+id_rapp+".pdf";
                downloadLink.href = "./rapport_"+id_rapp+".pdf";
                downloadLink.style.display = "block";
                document.body.appendChild(downloadLink);
                console.log(downloadLink)
               downloadLink.click();

},

});

   });


$('.viewText').on('click',function(){

     
  let id_rapp=$(this).attr('data-id');

         
       $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_get_rapport',
                         id: id_rapp

                      },
                 success: function (resp) {
                    console.log(resp)
                    result=JSON.parse(resp);
                     //$('#textModal').reset()
                    $('#texte').text(result.texte)
                 
                    
                },
                 error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call, itself, failed, e.g., a syntax error
                // in your_function()
                alert ('Request failed: ' + thrownError.message) ;
                },
            }) ;
});


$('.viewRep').on('click',function(){

  let id_rapp=$(this).attr('data-id');

  
         
       $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_get_rapport',
                         id: id_rapp

                      },
                 success: function (resp) {
                   console.log(resp)
                    result=JSON.parse(resp);
                     
                     let reponse =JSON.parse(result.reponse)
                    let bloc_rep=''
                     bloc_rep += '<H2 style="font-weight:bold;font-size:19px;color:'+getColor(reponse.unique)+'">'+reponse.unique+'% unique</H2>'
                        bloc_rep += '<table  class="table table-bordered" >';
                        bloc_rep += '<thead><tr>';
                        bloc_rep += '<th>Results</th>';
                        bloc_rep += '<th>Query</th>';
                        bloc_rep += '<th>Domains</th>';
                        bloc_rep += '</tr>';
                        bloc_rep += '</thead>';
                        bloc_rep += '<tbody>';

                        $.each(reponse.results, function(k,v)
                          {
                            bloc_rep+="<tr>";
                            bloc_rep+="<td id='result_"+k+"'>"+v.nb+"</td>";
                            bloc_rep+="<td id='query_"+k+"'><a target='_blank' href='"+v.url_req+"'>"+v.req+"</a></td>";

                            bloc_rep+="<td id='domains_"+k+"'>"
                             $.each(v.domains, function(c,d){
                              bloc_rep+="<a target='_blank' href='"+d.url+"'>"+d.domain+"</a><br>"
                             });
                            bloc_rep+="</td>";
                            bloc_rep+="</tr>";
                                       
                          });

                        bloc_rep+='</tbody></table>'

                    $('#reponse').html(bloc_rep)
                    
                 
                    
                },
                 error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call, itself, failed, e.g., a syntax error
                // in your_function()
                alert ('Request failed: ' + thrownError.message) ;
                },
            }) ;
});

$('.exportPDF').on('click',function(){

  let id_rapp=$(this).attr('data-id');

  
         
       $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_get_rapport',
                         id: id_rapp

                      },
                 success: function (resp) {

                  let response=$.parseJSON(resp);



                  }


                });

     });



$('#activate').on('click',function()
{

        $api_key=$('#token').val();

        console.log($api_key)
                
         
       $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_activation_account',
                         token: $api_key

                      },
                 success: function (resp) {
            console.log(resp)
                    result=JSON.parse(resp);
                    if(result.error==1)
                    {
                      $('#token').css('border','1px solid red')
                      $('#token').addClass('is-invalid');
                      $('#token').removeClass('is-valid');
                      
                    }
                    else{
                      $('#token').css('border','1px solid green')
                      $('#token').removeClass('is-invalid');
                      $('#token').addClass('is-valid');

                   window.location = "/wp-admin/admin.php?page=plagia"                
    }
                    
                },
                 error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call, itself, failed, e.g., a syntax error
                // in your_function()
                alert ('Request failed: ' + thrownError.message) ;
                },
            }) ;
       

})



$('.viewContent').on('click',function(){

  let id_post=$(this).attr('data-id');

 
         
       $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_getpost_byID',
                         id: id_post

                      },
                 success: function (resp) {
                    //console.log(resp)
                     result=JSON.parse(resp);

                    $('#p_content').text(result.content)
                 
                    
                },
                 error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call, itself, failed, e.g., a syntax error
                // in your_function()
                alert ('Request failed: ' + thrownError.message) ;
                },
            }) ;
});


$('#selectAll').on('change',function(e){
  
    var table= $(e.target).closest('table');
    $('td input:checkbox',table).prop('checked',this.checked);


});

$('#checkAuto').on('click',function(){

  $('#modeModal').modal('hide')

  var selectIDs = $("#auto-table input[name='selection']:checked").map(function(){
      return $(this).val();
    }).get(); 
    selectIDs.forEach(function(elm){

      $('#result_'+elm).html("<div class='spinner-border text-primary text-center' role='status'><span class='sr-only'>Loading...</span></div>")
       

        let mode=$('input[name="mode"]:checked').val();



       $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_getpost_byID',
                         id: elm

                      },
                 success: function (resp) {
                       
                       result=JSON.parse(resp);
                       
                       let myPost=result.Post;
                       
                       texte_verif=myPost.post_title+' '+result.content;

                      console.log(mode)

                     check_automatique(mode,texte_verif,elm)
                 
                    
                },
                 error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call, itself, failed, e.g., a syntax error
                // in your_function()
                alert ('Request failed: ' + thrownError.message) ;
                },
            }) ;
      
      
    })
  
});



function check_automatique(mode,text,id_post)
{
   let id_rapport;
   let mode_req;

   //adding the new rapport
    $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_add_rapport',
                         mode:mode,
                         text: text,
                         postID:id_post

                      },
                 success: function (resp) {


                    id_rapport=$.parseJSON(resp).id
            
                    console.log('rapport added success',id_rapport)

                     

                      //mode LIVE 
      if(mode==0){
                  
              mode_req='live';

              var request = $.ajax({

                url: "https://logicielantiplagiat.fr/check/api",

                type: 'post',
                crossDomain: true,

                data:{
                         token: $UserToken,
                         text: text,
                         pays:$user.pays,
                         langue: $user.langue,
                         mode:'live'
        
                      },

                      success: function(reponse){

                            result=reponse;
                  
                   let bloc_rep=''

                   $.ajax({

                      url: ajax_url,

                      type: 'POST',

                         data:{
                         action: 'plagia_update_rapport',
                         id:id_rapport,
                         response:reponse,
                         

                      },
                 success: function (data) {

                     let reponse_rapp=JSON.parse(data).reponse

                     rap_rep=JSON.parse(reponse_rapp)

                    if(result.success==1){
                          $('#result_'+id_post).html("<span style='font-weight:bold;color:"+getColor(rap_rep.unique)+"'>"+rap_rep.unique+"% </span>")
                          $('#response_'+id_post).html('<span role="button" data-toggle="modal" data-target="#reponseModal" class="dashicons dashicons-visibility  viewRep" data-id="'+id_rapport+'"></span>');
     

                   }
                   else{

                     $('#result_'+id_post).html("<span style='font-weight:bold:color:red'>ERROR</span>")
                   }
                },
                 error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call, itself, failed, e.g., a syntax error
                // in update rapport
                alert ('Request failed: ' + thrownError.message) ;
                      },
                       }) ;

                      },
                      error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call, itself, failed, e.g., a syntax error
                // in live mode check
                       console.log ('Request LIVE CHECK failed: ' + thrownError.message) ;

                       $('#result_'+id_post).html("<span style='font-weight:bold:color:red'>ERROR</span>")

                      },

             });

            }

//mode DIFFERE
            else{
                   console.log('ici mode differre')


                   //ici mode differre

           var request = $.ajax({

                url: "https://logicielantiplagiat.fr/check/api",

                type: 'post',
                crossDomain: true,

                data:{
                         token:    $UserToken ,
                         text:     text,
                         pays:     $user.pays,
                         langue:   $user.langue,
                         mode:     'post',
                         ref:  id_rapport,
                         domain : $user.domaine,
                         postback_url: 'http://wp.insightful.pro/wp-content/plugins/plagia/post_mode.php'

        
                      },

                      success: function(reponse){
                         
console.log('802',reponse)
                         $.ajax({

                            url: ajax_url,

                            type: 'POST',

                            data:{
                                   action: 'plagia_get_rapport',
                                   id: id_rapport

                                  },
                              success: function (resp) {
                                     // console.log(resp)
                                     let  result=$.parseJSON($.parseJSON(resp).reponse);

                                     console.log(result)

                                     if(result.success==1){
                                         $('#result_'+id_post).html("<span style='font-weight:bold;color:"+getColor(result.unique)+"'>"+result.unique+"%</span>")
                                      }
                                     else{

                                        $('#result_'+id_post).html("<span style='font-weight:bold:color:red'>ERROR</span>")
                                      }
                 
                    
                                  },
                                  error: function (xhr, ajaxOptions, thrownError) {
                                     // this error case means that the ajax call, itself, failed, e.g., a syntax error
                                     // in your_function()
                                       alert ('Request failed: ' + thrownError.message) ;
                                  },
                              }) ;
                           

                      },




                      error: function (xhr, ajaxOptions, thrownError) {
                       // this error case means that the ajax call, itself, failed, e.g., a syntax error
                       // in post mode check
                         console.log ('Request POST CHECK failed: ' + thrownError.message) ;

                        $('#result_'+id_post).html("<span style='font-weight:bold:color:red'>ERROR</span>")

                      },

                   });


                 }


                },

                error: function (xhr, ajaxOptions, thrownError) {
                // this error case means that the ajax call of adding rapport, itself, failed, e.g., a syntax error
               
                alert ('Request failed: ' + thrownError.message) ;
                },
            }) ;

}



$('#save').on('click',function(){


       $.ajax({

                url: ajax_url,

                type: 'POST',

                data:{
                         action: 'plagia_update_settings',
                         form: $('#settingsForm').serializeArray(),
                         id_user: $UserID

                      },
                 success: function (resp) {


                       location.reload()                    


                  }

                });

})

/**********************************************************/

$('#flesch').on('click',function(){
var str = $("#texte").val();
let words=str.split(' ').length
         
    let syllables=$count_how_many_syllables('texte')

    const re = /[.!?]/;
const numOfSentences = str.split(re);
phrases=numOfSentences.length - 1;
let totalsyl=0;
syllables.forEach(function(elm){
  totalsyl=totalsyl+elm;
})
let rslt='';
rslt+='<span>Syllables : '+totalsyl+' </span><br><span>Mots : '+words+' </span>'
rslt+='<br><span>Phrases : '+phrases+' </span>'

Score=206.84-(1.015*words/phrases)-(84.6*(totalsyl/words))
rslt+='<br><H2>Score Flesch: '+Score+' </H2>'


    $('#result').html(rslt)


  })



function $count_how_many_syllables($input) {
   
        var arrayOfLines = $("[name=" + $input + "]").val().match(/[^\r\n]+/g);
        
        var tempArr = [];
        var $content;
        var word;
        var $syllable_count;
        var $result;

        for (var i = 0; i < arrayOfLines.length; i++) {
         
            $content = arrayOfLines[i];
            word = $content;
            console.log('ici',word)
            word = word.toLowerCase();
            if (word.length <= 3) {
                word = 1;
            }
            if (word.length === 0) {
                return 0;
            }
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
                .replace(/^y/, '')
                .match(/[aeiouy]{1,2}/g).length;
            $syllable_count = word;

            $result = $syllable_count;
            tempArr.push($result);
        }

        return tempArr;

    
}









 getColor = ($per)=> {

  if($per< 60)
  return  'red';

  else if($per < 70)

    return 'orange';

  else
 return 'green';

 }
  







}); //end jquery


