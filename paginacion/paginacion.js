/* *******************************
 * Paginación para Blogger más ligera, configurable y fácil | Post: http://emiliocoboscmc.blogspot.com/2012/04/paginacion-para-blogger-mas-ligera.html
 * Creado por Emilio Cobos Álvarez | http://emiliocoboscmc.blogspot.com
 * Creative Commons 3.0 by-nc-nd |Más permisos en ecoal95[en]gmail.com
 * *********************************/

//Opciones de ejemplo
var opcionesPaginacion = {
	//Ésta no hace falta especificarla, viene por defecto
	paginaActual: location.href,
	//Post por cada página
	postPorPag: 7,
	//El número de entradas que tiene la primera página
	postsPrimeraPag: 7,
	//El cantidad de botones que tiene.
	numerosDePag: 6,
	//Texto del botón anterior
	textoAnterior: "Anterior",
	//Texto del botón siguiente
	textoSiguiente: "Siguiente",
	//Texto del botón para ir a la primera
	textoPrimera: "&laquo;",
	//Texto del botón para ir a la última
	textoFin: "&raquo;",
	//Si se quiere que se muestre "..." si se han recortado páginas
	mostrarPuntos: true,
	//La clase que se muestra para el botón de la página actual
	claseActual: "activo",
	//La plantilla de los links:
	//Nota: Es necesario que haya mínimo una clase (si no se quiere, es posible poner class='')
			//Si no no funciona el la clase para el botón actual
	//{{link}}=>La url
	//{{num}}=>El número de página o textos de Anterior, Primera...
	plantillaPagLink: "<span class='boton'><a href='{{link}}'>{{num}}<\/a><\/span>",
	//La plantilla del resto.
	//{{num}}=> El número de página actual y los puntos suspensivos
	plantillaPagPlain: "<span class='boton'>{{num}}<\/span>",
	//El contenedor en el que estarán (por la parte de arriba).
	//En esta opción y en la siguiente es posible usar el texto {{total}} para mostrar el número de páginas total
		//Ej: '<div class="contenedor-pags"><span class='total'>{{total}}</span>
	htmlBefore: '<div class="contenedor-pags"><div class="grupo-botones paginacion">',
	//Lo mismo pero para después. recuerda cerrar todas las etiquetas abiertas
	htmlAfter: '<\/div><\/div>'
};
function paginacion(json) {
	//Opciones
	var opt = opcionesPaginacion || {},
		urlActual = opt.paginaActual || location.href,
		postsPP = opt.postPorPag || 7,
		postsPrimPag = opt.postsPrimeraPag || postsPP,
		pagMax = opt.numerosDePag || null,
		claseActual = opt.claseActual || 'activo',
		textoAnterior = opt.textoAnterior || "Anterior",
		textoSiguiente = opt.textoSiguiente || "Siguiente",
		textoPrimera = opt.textoPrimera || "&laquo;",
		textoFin = opt.textoFin || "&raquo;",
		mostrarPuntos = opt.mostrarPuntos,
		plantillaPagLink = opt.plantillaPagLink || "<span class='boton'><a href='{{link}}' {{rel}}>{{num}}<\/a><\/span>",
		plantillaPagPlain = opt.plantillaPagPlain || "<span class='boton'>{{num}}<\/span>",
		htmlBefore = opt.htmlBefore || '<div class="contenedor-pags"><div class="grupo-botones paginacion">',
		htmlAfter = opt.htmlAfter || '<\/div><span class="total">({{total}})</span></div>',
	//Funciones para ayudar
		//usamos la fecha para obtener un link
		getLink = function (num, fecha, rel) {
			fecha = fecha !== homeUrl ? ('/search' + homeUrl + '?updated-max=' + fecha + '&max-results=' + postsPP) : fecha !== '/' ? ('/search'+homeUrl) : fecha;
			return plantillaPagLink.replace(/{{num}}/g, num).replace(/{{link}}/g, fecha).replace(/{{rel}}/g, rel ? 'rel="' + rel + '"' : '');
		},
		getPlain = function (num, sinclase) {
			//Aquí añadimos la clase actual. si sinclase es true o está definida, sólo añadiremos el número (para puntos suspensivos...)
			if ( sinclase === undefined ){ return plantillaPagPlain.replace(/{{num}}/g,num ).replace(/class=("|')([^"']*)/,"class=$1$2" + " " + claseActual)}
			return plantillaPagPlain.replace(/{{num}}/g, num )
		},
		//Recortar la array "html"
		recortar = function ( primero, segundo ){
			if ( ! segundo ) { segundo = primero; primero = 0}
			html = html.slice(primero,segundo)
		},
	//Función principal
		//Fix para el bug de las páginas con etiquetas
		enLabel = urlActual.match(/\/label\/[^?]*/),
		//La primera página. Si estamos en una etiqueta será lo que coincida con search/label/nombreEtiqueta/ (tened en cuenta que search se lo añadimos después)
		homeUrl = enLabel === null ? '/' : enLabel[0],
		entradas = json.feed.entry,
		numEntradas = entradas.length,
		listaFechas = [],
		html = [],
		fechaActual,
		i = postsPrimPag - 1,
		j = 0,
		flagActual,
		paginasTotales = 0,
		//[Primera,Anterior,...]
		htmlPrev = [],
		//[...,Siguiente,Última]
		htmlNext = [],
		temp,
		cortadaAlante,
		cortadaAtras,
		entrada, fecha;
	/*Vamos cogiendo el post numero "i" (o los que sean), y vamos sumando por página*/
	for( ; entrada = entradas[i]; i += postsPP ) {
		fecha = entrada.published.$t;
		//Encriptamos la fecha para poder usarla en la URL
		fecha = encodeURIComponent( fecha.substring( 0, 19 ) + fecha.substring( 23, 29) );
		//Si estamos en esa página, marcamos que esta es la actual
		if( urlActual.indexOf(fecha) !== -1 ){
			flagActual = listaFechas.length;
		};
		//Si no es la última entrada. Da problemas con medidas muy justas...
		if( entradas[i+1] ){
			listaFechas.push( fecha );
		}
	};
	paginasTotales = listaFechas.length + 1;
	
	//Insertamos El primero al html
	//Si no estamos en la primera
	if( flagActual !== undefined ){
		htmlPrev.push( 
			//Primera página, dependiendo de si estamos en etiqueta o no
			getLink( textoPrimera , homeUrl ),
			//Anterior
			listaFechas[flagActual-1] ? getLink( textoAnterior, listaFechas[flagActual-1] ) : flagActual === 0 ? getLink( textoAnterior, homeUrl, 'prev' ) : ''
			)

		html.push( getLink( 1 , homeUrl ) );
		
	//Si sí lo estamos
	}else{
		html.push( getPlain( 1 ) );
		flagActual = -1
	}
	
	//Para el loop uso Length porque se detecta la cadena vacía como 'undefined'
	for(; j < listaFechas.length; j++){
		fechaActual = listaFechas[j]
		if( j === flagActual ){
			html.push( getPlain(j + 2) )
		//tened en cuenta que esto no se ejecutará si la fecha es la última (se ejecutará lo de arriba),
		//por lo que no tendremos en ese caso "siguiente" y "última"
		} else{
			html.push( getLink( j + 2  ,fechaActual ))
		}
		if( j === listaFechas.length -1 && j !== flagActual ){
			htmlNext.push(
			//Siguiente (si hay fecha siguiente)
				listaFechas[ flagActual + 1] ? getLink( textoSiguiente, listaFechas[flagActual + 1], 'next' ) : '',
			//botón último
				getLink( textoFin, fechaActual)
			);
			
		}
	}
	
	//Recortamos la lista ==> Ésto es lo más difícil
	if( pagMax && html.length >= pagMax ){
		//tened en cuenta que hemos insertado el primer botón, eso quiere decir que hay que sumar 1 al index
		flagActual++
		//Éste es el caso estándar... Quitamos la mitad de alante y la mitad de atrás, o si no es exacto, intentamos dejar más de alante que de atrás
		if( html[flagActual - Math.floor(pagMax/2)] && html[flagActual + Math.ceil(pagMax/2)] ){
			cortadaAlante =	flagActual - Math.floor(pagMax/2) !== 0;
			cortadaAtras = flagActual + Math.ceil(pagMax/2) !== html.length;
			//Con floor y ceil nos aseguramos de coger el valor correcto
			recortar( flagActual - Math.floor(pagMax/2),flagActual + Math.ceil(pagMax/2) );
		//si es de las primeras páginas
		} else if( flagActual <= pagMax/2 ){
			//Si la página es la primera o de las primeras, cogemos los n primeros fragmentos
			recortar( pagMax )
			cortadaAtras = true
		//si es de las últimas
		}else if( flagActual >= html.length - pagMax/2 ){
			recortar( html.length - pagMax,html.length )
			cortadaAlante = true
		}
	}
	
	//Añadimos puntos suspensivos si  ha sido cortada y está habilitada la opción.
	if ( mostrarPuntos ) {
		if ( cortadaAlante ) {
			htmlPrev.push( getPlain("...",true) )
		}
		if ( cortadaAtras ) {
			htmlNext.unshift(getPlain("...",true))
		}
	}
	//Unimos todo
	html = htmlPrev.concat(html,htmlNext)
	document.getElementById('blog-pager').innerHTML = htmlBefore.replace(/{{total}}/g,paginasTotales) + html.join("") + htmlAfter.replace(/{{total}}/g,paginasTotales)
}