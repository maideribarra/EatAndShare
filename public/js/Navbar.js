document.write("<header id=\"header\">");
    document.write("<div class=\"header-middle\">");
      document.write("<div class=\"container\">");
        document.write("<div class=\"row\">");
          document.write("<div class=\"col-sm-4\">");
            document.write("<div class=\"logo pull-left\">");
              document.write("<a href=\"index.html\"><img src=\"images/grilling-308914_640.png\" alt=\"\" /></a>");
            document.write("</div>");
            document.write("<div class=\"searchform\">");
            document.write("<input type=\"text\" id=\"search\" placeholder=\"Search\" />");               
          document.write("</div>");            
          document.write("</div>");          
          document.write("<div class=\"col-sm-8\">");
            document.write("<div class=\"shop-menu pull-right\">");
              document.write("<ul class=\"nav navbar-nav\">");
                document.write("<li><a href=\"#\" onclick=\"signOut();\"><i class=\"fa fa-lock\"></i>Sign out</a></li>");                
                document.write("<meta name=\"google-signin-client_id\" content=\"975558376993-42taqsf439ccp3gecord6blrdabvb59b.apps.googleusercontent.com\">");
                document.write("<div class=\"g-signin2\" data-onsuccess=\"onSignIn\"></div>");
              document.write("</ul>");
            document.write("</div>");
          document.write("</div>");
        document.write("</div>");
      document.write("</div>");
    document.write("</div>");  
    document.write("<div class=\"header-bottom\">");
      document.write("<div class=\"container\">");
        document.write("<div class=\"row\">");
          document.write("<div class=\"col-sm-9\">");
            document.write("<div class=\"navbar-header\">");
              document.write("<button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".navbar-collapse\">");
                document.write("<span class=\"sr-only\">Toggle navigation</span>");
                document.write("<span class=\"icon-bar\"></span>");
                document.write("<span class=\"icon-bar\"></span>");
                document.write("<span class=\"icon-bar\"></span>");
              document.write("</button>");
            document.write("</div>");
            document.write("<div class=\"mainmenu pull-left\">");
              document.write("<ul class=\"nav navbar-nav collapse navbar-collapse\">");
                document.write("<li><a href=\"index.html\" class=\"active\">Recetas</a></li>");
                document.write("<li class=\"dropdown\"><a href=\"#\">Mis Recetas</a>");
                                    document.write("<ul role=\"menu\" class=\"sub-menu\">");
                                        document.write("<li><a href=a\"shop.html\">Products</a></li>");
                    document.write("<li><a href=\"product-details.html\">Product Details</a></li>"); 
                    document.write("<li><a href=\"checkout.html\">Checkout</a></li>"); 
                    document.write("<li><a href=\"cart.html\">Cart</a></li>"); 
                    document.write("<li><a href=\"login.html\">Login</a></li>"); 
                                    document.write("</ul>");
                                document.write("</li>"); 
                document.write("<li class=\"dropdown\"><a href=\"#\">Restaurantes</a>");
                                    document.write("<ul role=\"menu\" class=\"sub-menu\">");
                                        document.write("<li><a href=\"blog.html\">Blog List</a></li>");
                    document.write("<li><a href=\"blog-single.html\">Blog Single</a></li>");
                                    document.write("</ul>");
                                document.write("</li>"); 
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
}

  
  jQuery('#search').keypress(function(e) {
    var path='/search/'
  var query=path.concat(text);
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13') {
        jQuery.ajax({
          url: query,
          type: 'GET', 
          success: function () {  
            console.log("enviado");          
          }
 })
    }
});
  
