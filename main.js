//instatiating pageWalker Class with a container that would display all your views

var app = new __PageWalker(cont)

//the listen method is a method that registers a view, the first parameter is the view to match, where as the 2nd to nth parameter should be a function that will be executed  if the url is matched.

// => '/' is like the default view, just like ur normal index file

	.listen('/', function (){
		app.slide()
		.setTitle('home page')
		.view('<h1> hello from home </h1>');
	})

// => from here you can register as many route as u want, note name must be different

	.listen('/contact', function(){
		app.slide()
		.setTitle('contact')
		.view(__contact);
		alert('hy')
	})

// => use this if you want to match 404 pages, that is the function below will execute if the url is not registered as a route

	.listen('!', function(){
		app.setTitle('404 Not Found!')
		.slide()
		.view("<h1> Not Found!</h1>");
	})

	// => this will match anything beginning with '/home/' then followed by anything

	.listen('/home/*', function(){
	})

	// => this will match anything beginning with '/' then followed by anything, that is to say that this function will always run regardless, even if the route is registered or not

	.listen('/*', function(){
		// alert('here')
	})

	//registering an about page

	.listen('/about', function(){
		app.slide();
		app.setTitle('about page')
		.view(__about);
	})

	//=> pageWalker also supports regular expression the function below will run
	//once something like '/home/9/test/foo' is visited in the address bar

	.listen('/home/{id:[0-9]+}/test/{name:[a-y]+}', function(id, name){
		app.slide()
		.setTitle('hello ' + name || "")
		.view("<div class='con'><h1> viewing from atleast one number and words </h1></div>")
	})

	//=>  function below will run
	//once something like '/home/9/test/9' is visited in the address bar
	//the two parameters must be a single number


	.listen('/home/{id:[0-9]}/test/{name:[0-9]}', function (id, name){
		app.slide()
		.setTitle('hello ' + name || "")
		.view("<div class='con'><h1> viewing from one number and one number </h1></div>")
	})

	//=>  function below will run
	//once something like '/home/h/test/bar' is visited in the address bar
	//the first parameter must be a single letter whereas the second a word

	.listen('/home/{id:[a-y]}/test/{name:[a-y]+}', function (id, name){
		app.slide()
		.setTitle('hello ' + name || "")
		.view("<div class='con'><h1> words and words </h1></div>")
	})

	//=> pageWalker handles form internally
	// this is a function that will run once the form in about page is submitted
	//the function sets up a listener using app.get
	//once the values of the form submitted matches something like
	// '/username/{test}/password/{noble}'

	function former(){
		var pattern = '/username/{test}/password/{noble}';
		app.get(pattern, function (uname, pass){
			app.setTitle('welcome ' + uname)
			.slide()
			.view("<h1> form submitted, welcome " + uname + " your password is " + pass  + "</h1>");
		});
	}

	// u can also use "#"'s to navigate through elements
	//give an element an id visit that route type # followed by the id
	//e.g visit home route type '#noble'
	// it will look like something like url/index.html/#/home#noble'
	// and the window will automatically scroll to the element
