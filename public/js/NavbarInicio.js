document.write("<header id=\"header\">");
    document.write("<div class=\"header-middle\">");
      document.write("<div class=\"container\">");
        document.write("<div class=\"row\">");
          document.write("<div class=\"col-sm-4\">");
            document.write("<div class=\"logo pull-left\">");
              document.write("<a href=\"index.html\"><img src=\"images/grilling-308914_640.png\" alt=\"\" /></a>");
              document.write("<p>Eat and Share</p>");
            document.write("</div>");
           document.write("</div>");          
          document.write("<div class=\"col-sm-8\">");
            document.write("<div class=\"shop-menu pull-right\">");
              document.write("<ul class=\"nav navbar-nav\">");
                                
                document.write("<meta name=\"google-signin-client_id\" content=\"424438025486-l9gg52r4l92s1dk625o4i6ccufush3iv.apps.googleusercontent.com\">");
                document.write("<div class=\"g-signin2\" data-onsuccess=\"onSignIn\"></div>");
              document.write("</ul>");
            document.write("</div>");
          document.write("</div>");
        document.write("</div>");
      document.write("</div>");
    document.write("</div>");  
    document.write("<div  class=\"inpUsuario hide\">");
    document.write("<input id=\"Usuario\" name=\"usuario\" type=\"text\" placeholder=\"Ingredientes\"/>");          
    document.write("</div>"); 
  document.write("</header>");

  function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  }
  function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  document.getElementById("Usuario").value=profile.getEmail();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  location.href="http://localhost:5000/index";
}

  
  jQuery('#search').keypress(function(e) {
    var path='/search/'
  var query=path.concat(document.getElementById("search").value);
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13') {
        jQuery.ajax({
          url: query,
          type: 'GET', 
          success: function () {  
            console.log("enviado");  

          }
 }).done(function(data) {
             
                     
        })
        .fail(function() {
            
            alert("error");
            
        });
  
    }
});
  
