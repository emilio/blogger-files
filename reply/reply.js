(function(window, document, undefined){
	/*
	 * Código bajo licencia CC 3.0 Atribución No comercial
	 * @author Emilio cobos <ecoal95@gmail.com>
	 * URL sin comprimir: http://dl.dropbox.com/u/71679931/share/reply.js
	 * URL del post para implementarlo: 
	 *	http://emiliocoboscmc.blogspot.com/2012/08/anadir-la-funcionalidad-de-cancelar-los.html
	 * Basado en el trabajo de Felipe Calvo (http://gplus.to/iFelipeCalvo)
	 * Comentarios anidados para blogger con la posibilidad de cancelar
	 */
	var indexa = "<data:top.id/>",
		indexb = "<data:post.id/>",
		flagitem;

		<b:if cond='data:blog.pageType == &quot;item&quot;'>
			flagItem = "&amp;postID=";
		</b:if>
		<b:if cond='data:blog.pageType == &quot;static_page&quot;'>
			flagItem = "&amp;pageID=";
		</b:if>
	//<![CDATA[
	// Configurar el texto para cambiarlo fácilmente
	// Set the text for easy manipulation
	var REPLY_TEXT = "Responder",
		CANCEL_TEXT = "Cancelar";
	// Abreviar document.getElementById
	// Abrieviate document.getElementById
	function $$(id){
		return document.getElementById(id)
	}
	// document.getElementsByTagName (o un contexto)
	// document.getElementsByTagName (or a context)
	function $(tag, context){
		return (context || document).getElementsByTagName(tag);
	}
	// Crear un elemento con estilo y atributos
	// Creates an element, whith styles and attributes
	function create(tag, props){
		var el = document.createElement(tag);
		if( typeof props === 'object' && props !== null){
			for( var i in props ){
				if( i === 'attributes' ){
					for ( var j in props[i] ){
						el.setAttribute(j, props[i][j]);
					}
				}
				else if( i === 'style' ){
					for ( var j  in props[i] ){
						el.style[j] = props[i][j]
					}
				} else {
					el[i] = props[i];
				}
			}
		}
		return el;
	}
	// Añadir un evento (click, mouseover, etc), con compatibilidad completa para IE
	// Add event listeners, whith IE compatibility
	function addEvent(elementos, tipo, funcion ){
		if( ! elementos ){ return false}
		if(  ! elementos.addEventListener && ! elementos.attachEvent && typeof elementos.length === "number" ){
			for( var i = 0, len = elementos.length; i < len; i++){
				addEvent(elementos[i], tipo, funcion)
			};
			return false;
		}
		if(window.addEventListener){
			return elementos.addEventListener(tipo, funcion, false)
		} else {
			elementos.attachEvent('on' + tipo, function(e){
				e = e || window.event;
				if( ! e.preventDefault ){
					e.target = e.target || e.srcElement
					e.preventDefault = function(){
						this.returnValue = false;
					};
					e.stopPropagation = function(){
						this.cancelBubble = true;
					};
				}
				return funcion.call(elementos, e)
			})
		}
	};
	// Comprobar si un elemento tiene una clase
	// Hasclass function for "filterByClass"
	function hasClass(el, clase){
		return new RegExp("(\\s|^)(" + clase + ")(\\s|$)").test(el.className)
	}
	// Eliminar un elemento del DOM
	// Remove an element from the DOM
	function remove(el){
		return el.parentNode && el.parentNode.removeChild(el);
	}

	// Filtrar una Nodelist dejando sólo los que tengan una clase
	// Usado para la compatibilidad con IE7
	// Get from an nodelist or array those elements whith an especific class 
	// Used for IE7 compatibility
	function filterByClass(array, clase){
		var result = [], 
			i = 0, 
			len = array.length;
		for( ; i < len; i++ ){
			if( hasClass(array[i], clase) ) result.push(array[i]);
		}
		return result.length ? result : null;
	}
	// Crea el iframe de blogger con la src especificada
	// Creates the blogger iframe whith the given src
	function generateIframe(src){
		return create("iframe", {
			src: src,
			id: "comment-editor",
			name: "comment-editor",
			style: {
				height: "250px",
				width: "100%",
				border: "0"
			},
			attributes: {
				frameborder: "0",
				allowtransparency: "true"
			}
		});
	}
	///////////////////////////////////
	// Fin de las funciones de ayuda
	// End helper functions
	//////////////////////////////////
	// Nos hacemos con los comentarios para obtener todos los links con la clase "reply-link"
	// We grab the comments for getting every link with "reply-link" className
	var comments = $$('comments'),
		replyLinks = comments.querySelectorAll ? comments.querySelectorAll('.reply-link') : filterByClass($('a', comments), 'reply-link'),
		// Seleccionar el iframe (comment-editor)
		// Grab the current comment editor (the iframe)
		commentEditor = $$("comment-editor"),
		// Comgemos la src para conseguir el hash, parámetros que enviamos a blogger para controlar el aspecto
		// Grab the src for getting the hash, parameters that determine the appearence of the iframe
		src = commentEditor.src,
		hash = src.substring(src.indexOf("#")),
		// El div donde va el iframe
		// The form
		commentForm = $$("comment-form") || $$("comment-form-thread"),
		// Botón para cancelar, que ahora mismo debería de no existir (null)
		// Main cancel button. Right now it sholdn't exists (null)
		replypost = $$('replypost'),
		// Cuando hacemos click en el botón anterior, cancelamos la respuesta, pero no cambiamos el texto de "cancelar"
		// Esta variable es para eso
		// When you click on replypost, you cancel the reply, but you dont change the text of the "cancel"
		// We use this variable to get that
		currentLink = null;

	// Cancelar la respuesta
	// Cancel the reply
	function replyOriginal(){
		// La src basada en los parámetros obtenidos al principio del script
		// Src based on the params we got at the beggining of the script
		var src = "http://www.blogger.com/comment-iframe.g?blogID=" + indexa + flagItem + indexb + hash;
		// Si hay un link con el texto de "cancelar"
		// If a link is with the text "cancel"
		if( currentLink ) {
			// Indicamos que ya no está respondiendo
			currentLink.setAttribute("data-reply-state", "none");
			// Ponemos el texto de responder
			// We change the text to "reply"
			currentLink.innerHTML = REPLY_TEXT;
			// Y indicamos que ya no hay link que esté para cancelar
			// And we indicate now there's no link for cancel
			currentLink = null;
		}
		
		// Eliminamos el iframe y creamos otro
		// We remove the iframe and generate other
		remove(commentEditor);
		commentEditor = generateIframe(src);

		// Si existe el link de cancelar principal lo eliminamos del DOM, pero manteniendo la referencia al nodo y los eventos correspondientes
		// If there is a global cancel button, we remove it from the DOM, but keeping the node reference and its event listeners
		if( replypost ){
			remove(replypost);
		}

		// We reset the position of the iframe
		commentForm.appendChild(commentEditor);
	}

	// La función de reply principal, añadida a los links cuando hacemos click
	// The main reply function, added to the links when we click
	addEvent(replyLinks, 'click', function(ev){
		
		// Cogemos la ID del comentario
		// We grab the comment id
		var commentId = this.getAttribute("data-comment-id"),
			// El contenedor del iframe
			// The new iframe container
			contenedor = $$('contenedorreply-' + commentId);
		
		// Prevenir (¿?) el evento, es decir, que cuando hagamos click no nos lleve a la url
		// Prevent the event
		ev.preventDefault();

		// Si ya estábamos respondiendo, queremos cancelar la reply
		// If we are replying, we want to cancel the reply
		if( this.getAttribute("data-reply-state") === "replying" ){
			// Así que "reseteamos" el link
			// So we "reset" the link
			this.setAttribute("data-reply-state", "none");
			this.innerHTML = REPLY_TEXT;
			currentLink = null;
			// Cancelamos la respuesta y no ejecutamos lo de abajo
			// We cancel the reply and don't execute the downer form
			return replyOriginal();
		}
		// Si no respondemos normalmente
		// Else we reply normally

		// Marcamos el link para saber que está respondiendo
		// We "flag" the link for to know we are replying
		currentLink = this;

		// Lo marcamos con el atributo y ponemos el texto de cancelar
		// We mark it too with the attribute and write the "cancel" text
		this.innerHTML = CANCEL_TEXT;
		this.setAttribute("data-reply-state", "replying")

		// Eliminamos el iframe y lo creamos otra vez
		// Remove the iframe and create it again
		remove(commentEditor);
		commentEditor = generateIframe("http://www.blogger.com/comment-iframe.g?blogID=" + indexa + flagItem + indexb + "&parentID=" + commentId + hash)

		// Lanzarlo al dom en el contenedor adecuado
		// Launch it to the dom
		contenedor.appendChild(commentEditor);

		// Si no hay link para cancelar global, lo creamos y lo ponemos en el lugar correcto
		// If there's no global cancel link, we create it and put it in the correct place
		if( ! replypost ){
			replypost = create("a", {
				innerHTML: "Agregar un comentario",
				id: "replypost",
				href: "#",
				className: "loadMore"
			})

			// Hacemos que cuando se haga click en el botón global se cancele la respuesta
			// We make that when we click the global cancel button we cancel the reply
			addEvent(replypost, 'click', function(ev){
				replyOriginal();
				ev.preventDefault();
			})
		}

		commentForm.appendChild(replypost);

	});

})(window, document)
//]]>