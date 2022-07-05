var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');

var app = http.createServer(function(request,response){
	var _url = request.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	
	if(pathname === '/'){
		var pageCount = fs.readdir(__dirname + '/data', function(err, fileList){
			
			function showNote(fileList){
				let data = '';
				
				for(var i=0; i<fileList.length; i++){
					data += '<h3>' + fileList[i];
					data += '</h3>';
					
					data += `<button onclick="location.href='/update?id=${fileList[i]}'">update</button>`
					data += `
					<form action='delete_note' method='post'>
						<input type='hidden' name='id' value='${fileList[i]}'>
						<input type='submit' value='delete'>
					</form>
					`
					
					data += fs.readFileSync(`./data/${fileList[i]}`);
				};
				return data;
			};
			
			var template = `
			<html>
				<h1>CRUD TodoList</h1>
					total pages: ${fileList.length}
					<button onclick="location.href='/create';">create</button>
					${showNote(fileList)}
			</html>
			`;
		
		response.writeHead(200);
    	response.end(template);
		});
    }
	
	else if (pathname === '/create'){
		var createForm =`
		<html>
			<form action='/create_note' method='post'>
				<p><input name='title' type='text' placeholder='title'></p>
				<p><textarea name='content' placeholder='content'></textarea></p>
				<p><input name ='submit' type='submit'></p>
			</form>
		</html>
		`
		response.writeHead(200);
        response.end(createForm);
	}
	else if (pathname === '/create_note'){
		var body = '';
		
		request.on('data', function(data){
			body += data;
		});
		request.on('end', function(){
			var post = qs.parse(body);
			var title = post.title;
			var content = post.content;
			
			fs.writeFile(`./data/${title}`, content, function(err){});
			response.writeHead(302, {Location: '/'});
        	response.end('success');
		});
	}
	
	else if (pathname === '/update'){
		var title = queryData.id;
		var content = fs.readFileSync(`./data/${title}`, {encoding:'utf8'});
		var updateForm =`
		<html>
			<form action='/update_note' method='post'>
				<input name='id' type='hidden' value='${title}'>
				<p><input name='title' type='text' value='${title}'></p>
				<p><textarea name='content'>${content}</textarea></p>
				<p><input name ='submit' type='submit'></p>
			</form>
		</html>
		`;

		response.writeHead(200);
		response.end(updateForm);
	}
	
	else if (pathname === '/update_note'){
		var body = '';
		
		request.on('data', function(data){
			body += data;
		});
		request.on('end', function(){
			var post = qs.parse(body);
			var id = post.id;
			var title = post.title;
			var content = post.content;
			
			fs.renameSync(`./data/${id}`, `./data/${title}`);
			fs.writeFile(`./data/${title}`, content, function(err){});
			response.writeHead(302, {Location: '/'});
        	response.end('success');
		});
	}
	
	else if (pathname === '/delete_note'){
		var body = '';
		
		request.on('data', function(data){
			body += data;
		});
		request.on('end', function(){
			var post = qs.parse(body);
			var id = post.id;
			
			fs.unlinkSync(`./data/${id}`);
			response.writeHead(302, {Location: '/'});
        	response.end('success');
		});
	}
	
	else {
		response.writeHead(404);
        response.end('Not found');
	}
	
	
	});

app.listen(3000);
