  (function(){
	/* =Opción: Cargar sumario ("summary") o contenido entero ("content")
	-------------------------------------------------------------------- */

	var contenidoParaUsar = "summary"


	/* =Cargar un script asíncronamente, con "intento" de arreglo para 
	   errores 503 (aunque no lo usaremos porque vale con hacer otro click)
	-------------------------------------------------------------------- */
	// Contexto: lo que es this
	function cargarJson( url, contexto, callback, error, cancelarSiError){
		var s  = document.createElement('script'),
			firstScript = document.getElementsByTagName('script')[0],
			loaded = false,
			// Creamos un callback con un nombre identificatorio
			callbackName = "ajaxSlider" + +new Date;

		// Creamos el callback en el contexto global para ser usado
		window[callbackName] = function(data){
			// Para detectar posibles errores 503, daremos como mucho 10 segundos al script para cargar
			loaded = true;
			// Ejecutamos el callback
			callback.call(contexto,data);
			// Borramos el script y la función
			s.parentNode.removeChild(s)
			window[callbackName] = undefined;
		}
		// Función de error
		setTimeout(function(){
			if( ! loaded ){
				window[callbackName] = undefined;
				error && error();
				!cancelarSiError && cargarJson( url, contexto, callback, error )
			}
			// 10 segundos para cargar
		}, 10000)
		// Añadimos el callback dinámicamente
		s.src = url + "&callback=" + callbackName;
		firstScript.parentNode.insertBefore(s,firstScript)
		return true
	}
	function eliminarEtiquetas(str){
		return str.replace(/<[^>]+(>|$)/g,"");
	}
	function addEvent(el, tipo, fn){
		if( el.length && typeof el.length === "number"){
			for( var i = 0, len = el.length; i < len; i++){addEvent(el[i], tipo, fn)}
		} else {
			el.addEventListener ? el.addEventListener(tipo, fn, false):
			el.attachEvent('on' + tipo, function(e){
				e= e || window.event;
				e.preventDefault = function(){this.returnValue = false;}
				e.stopPropagation = function(){this.cancelBubble = true;}
				fn.call(el, e)
			})
		}
	}
	function seleccionar_links_ajax(){
		var links = document.getElementById('Blog1').getElementsByTagName('a'),
			resultado = [];
		for( var i = 0, len = links.length, current; (current = links[i]) && i < len; i++ ){
			if(current.getAttribute('data-ajax-id') !== null) resultado.push(current);
		}
		return resultado;
	}
	/* =Ésto es lo interesante
	-------------------------------------------------------------------------*/
	var losLinks = document.querySelectorAll ?
		[].slice.call(document.querySelectorAll('#Blog1 a[data-ajax-id]')) : 
		seleccionar_links_ajax();
	addEvent(losLinks, 'click', function(e){
		var link = this,
			laId = link.getAttribute('data-ajax-id'),
			noEstaCargado = ! link.getAttribute('data-contenido-cargado');
		
		if( noEstaCargado ){
		// Usamos la posibilidad de cargar el feed de un post por id que nos da blogger
			cargarJson(
				'/feeds/posts/' + (contenidoParaUsar === "content" ? "default" : contenidoParaUsar) + '/' + laId + "?alt=json-in-script",
				// Queremos que "this" se refiera al post-body (sólo por ahorrar tiempo)
				document.getElementById('post-body-' + laId),
				// El callback
				function(data){
					var html = data.entry[contenidoParaUsar].$t;
					if(contenidoParaUsar === "summary"){
						this.innerHTML = eliminarEtiquetas(html) + "...<div class='jump-link'><a href='" + link.href + "'>Leer más&raquo;</a></div>";
					} else {
						this.innerHTML = html;
					}
					link.setAttribute('data-contenido-cargado', "true");
				}
			);
				// No queremos que nos lleve a la página si no está cargado
			e.preventDefault();
		}
		// Si está cargado no usaremos "preventDefault" y nos llevará a la página sin otro problema
	})
})();