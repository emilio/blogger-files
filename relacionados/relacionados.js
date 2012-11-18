//POSTS RELACIONADOS
var relacionados = {
	posts:[],
	//El número máximo de posts
	max:4,
	//la longitud máxima del resumen
	maxLen:100,
	imgPorDefecto:"http://emiliocobos.site40.net/blogger/images/blogger1.png",
	//El HTML que ocupará Lo podéis cambiar para hacer lo que sea.
	//He usado el mismo que http://vagabundia.blogspot.com/2010/12/posts-relacionados-con-miniaturas.html
	//Un ejemplo: Para hacer una lista con un enlace y el título pondríamos: '<li><a href="{{url}}" title="{{titulo}}">{{titulo}}<\/a><\/li>'
	plantilla:'<div class="relsposts"><a target="_blank" rel="nofollow" title="{{titulo}}" href="{{url}}"><img src="{{img}}" alt="{{titulo}}"/><\/a><h6><a target="_blank" rel="nofollow" title="{{titulo}}" href="{{url}}">{{titulo}}<\/a><\/h6><p>{{resumen}}</p><\/div>'
},
//Comparamos un objeto de los posts con la lista de posts dada
postRepetido = function(lista, el){
	var i = 0;
	for( ; lista[i]; i++){
		if( lista[i].url === el.url ) return true;
	}
	return false;
}
//Función para añadir a la variable relacionados los posts
function leerpostetiquetas(json) {
	var entradas = json.feed.entry,
		i = 0,
		k,
		entrada,
		links,
		rel;
	for (; entradas[i]; i++) {
		k = 0;
		//Éste es el post relacionado
		rel = {};
		
		//la entrada
		entrada = entradas[i];
		
		//los links
		links = entrada.link;
		
		//El título
		rel.tit = entrada.title.$t;
		
		contenido = entrada.content || entrada.summary;
		
		//El contenido
		rel.contenido = eliminattags( contenido.$t , relacionados.maxLen );
		
		//La imagen
		rel.img = entrada.media$thumbnail ? entrada.media$thumbnail.url : relacionados.imgPorDefecto || ''
		
		//El link
		for(; links[k] ; k++){
			if( links[k].rel === 'alternate' ){	rel.url = links[k].href;break;}
		}
		
		//Filtramos los posts para que no haya nunguno repetido ni el de la misma entrada
		if ( !postRepetido( relacionados.posts, rel ) &&  rel.url !== document.URL ){
			//Lo enviamos a relacionados
			relacionados.posts.push( rel )
		}
	}
}

function mostrarrelacionados(contenedor) {
	var posts = relacionados.posts,
		//un post al azar-->Empezaremos por el siguiente, luego este será el último
		index = Math.floor( Math.random() * posts.length ),
		//guardamos el último post
		ultimoPost = posts[index],
		//cuenta de los post que hemos mostrado
		postsMostrados = 0,
		//La salida, que llenaremos con las entradas
		salida = '',
		//La plantilla, en la que reemplazaremos títulos, urls, imagen, etc.
		//Podéis modificarla a vuestro gusto
		post;

	//el primer post será el siguiente
	if( index === posts.length - 1 ){ index = 0 }else{ index++ }
		
	for (;posts[index];index++){

		post = posts[index]

		//Vamos llenando la salida
		salida += relacionados.plantilla.replace(/{{titulo}}/g,post.tit).replace(/{{url}}/g,post.url).replace(/{{img}}/g,post.img).replace(/{{resumen}}/g,post.contenido)
		
		//Hemos acabado si ya hemos escrito el último post
		if( post === ultimoPost ){ break }
		
		//también si hemos mostrado tantos post como se nos pedían
		if( ++postsMostrados === relacionados.max ){break;}
		
		//El index es el último post, volvemos a empezar
		if( index === posts.length - 1 ){ index = -1 }//-1 porque al acabar el loop se convertirá en 0
	}
	
	//Escribimos la salida en el contenedor o directamente en el documento
	if(contenedor){
		contenedor = typeof contenedor === 'string' ? document.getElementById(contenedor) : contenedor;
		contenedor.innerHTML = salida
	}else{
		document.write(salida)
	}
}
//Eliminar las etiquetas
function eliminattags(cual,longitud){
  var resumen = cual.split("<");
  for(var i=0;i<resumen.length;i++){
    if(resumen[i].indexOf(">")!=-1){
      resumen[i] = resumen[i].substring(resumen[i].indexOf(">")+1,resumen[i].length);
    }
  }
  resumen = resumen.join("");
	return resumen.substring(0,longitud-1)+'...';
}