(function( window, document, undefined ){
/**********************************
 * Funciones de ayuda
 *********************************/
	//Para animar
	if(! Object.keys ){ 
		Object.keys = function(obj){
			var r = [],p;
			for( p in obj){
				r.push(p);
			}
			return r;
		};
	}
	function log(){
		window.console && console.log(arguments)
	}
	// Soporte para opacidad, y activar eventos "onload" de las imágenes
	// Vamos, que detectamos si es un IE 0-8
	// Ojo al comprimir!!!!!
	var isIE = /*@cc_on ! @*/!1;								//IE7- no tiene documentMode
	var navegadorAntiguo = isIE && (9 < document.documentMode || document.documentMode === undefined),
	// Easings para animar
	easings = {
		easeInQuad: function (frameAct, cambio, init, frames) {
			return init + cambio*(frameAct/=frames)*frameAct;
		}
	},
	// Retorna el estilo del elemento
	estilo = function (el){
		return window.getComputedStyle ? window.getComputedStyle(el, null) : el.currentStyle;
	},
	//Función para animar
	animar = function (el, props, tiempo , easing, callback){
		var esto = this,
			display = estilo(el).display,
			p,
			firstProp = Object.keys(props)[0];
		if(easing && typeof easing === "function"){callback = easing; easing = undefined;}
		for (var p in props){
			(p === firstProp)? hacerAnim(el, p, props[p], tiempo, easing, callback) : hacerAnim(el, p, props[p], tiempo, easing)
		}
	},
	// La animación en sí
	// Está bastante reducida con respecto a la original, que incluía soporte para colores RGBA, etc
	hacerAnim = function(el,prop, fin, tiempo, easing, callback){
		var fps = 60,
			frames = fps * tiempo / 1000,
			frameAct = i = 1,
			init = estilo(el)[prop],
			unit = prop === "opacity" ? '' : 'px',
			dif,
			time;
		// Damos por supuesti los valores "auto", etc como 0
		init = isNaN(parseFloat(init))? 0 : parseFloat(init)
		// Si animamos la altura, no queremos que nada quede fuera
		if(/height|width/.test(prop)){el.style.overflowX = el.style.overflowY = "hidden"}
		// He pensado en introducir la posibilidad de cambiar el easing de la animación
		easing = easings[easing]|| easings.easeInQuad
	
		dif = fin - init
		if(prop !== "opacity"){
			// Si la propiedad no es la opacidad, configuramos el valor inicial
			el.style[prop] = init + unit
		}else{
			// Si sí lo es, hay que distinguir si el navegador es IE<=8 (aplicaremos un filtro) o no (opacidad pura y dura)
			!navegadorAntiguo ? el.style[prop] = init : el.style.filter = "alpha(opacity="+100*init+")"
		}
		// Animación
		function an(){
			var valAct = easing(frameAct, dif, init, frames)
			if(prop === "opacity"){
				!navegadorAntiguo ? el.style[prop] = valAct : el.style.filter = "alpha(opacity="+100*valAct+")"
			}else{
				el.style[prop] = valAct + unit
			}
		frameAct++
		}
		// Final, usamos el callback, fijamos el valor definitivo, y paramos la animación
		function end(){
			clearTimeout(time)
			el.style[prop] = fin + unit
			if(callback && typeof callback === "function") callback.apply(el,arguments)
		}
		// Hacemos todo el timeout a la vez.
		for(;i <= frames;i++){
			time = setTimeout(an,tiempo/frames*i)
		}
		// El callback se ejecutará cuando el tiempo haya pasado por completo.
		setTimeout(end,tiempo)
	},
	// Borrar un elemento o varios del DOM
	remove = function(){
		forEach(arguments, function(el){
			el.parentNode && el.parentNode.removeChild(el)
		})
	},
	// Para todos. Algo parecido a Array.prototype.forEach
	forEach = function(array , fn ){
		for(var i = 0, len = array.length; i < len; i++ ){
			fn.call( null, array[i], i )
		}
	},
	// Body
	body = document.body,
	
	// Tamaño de la ventana
	// Usado para calcular el tamaño de imágenes, etc
	winSize = function(){
		return {
			scrollTop: window.pageYOffset || document.documentElement.scrollTop,
			scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
			width: window.innerWidth || document.documentElement.clientWidth,
			height: window.innerHeight || document.documentElement.clientHeight
		}
	},
	// Crear un elemento, con una etiqueta y atributos
	create = function( tag, props){
		var s = document.createElement( tag )
		// Si hay propiedades que asignar
		if( props ){
			// Si es texto, asignamos la id
			if( typeof props === 'string' ){
				s.id = props
			// Si no, usamos un objeto
			} else {
				// Usamos setAttribute para asignar todas
				for (var p in props){
					// Hay un problema con ciertas implementaciones, así que pasaremos un objeto como estilo.
					if(p === "style"){
						for (var prop in props[p]){
							s.style[prop] = props[p][prop]
						}
					// Si no, usamos setAttribute
					} else {
						s.setAttribute(p, props[p])
					}
				}
			}
	
		}
		return s
	},
	// Añadir un evento a un sólo elemento. Implementado preventDefault y stopPropagation
	evSingle = function (el, tipo ,fn ){
		el.addEventListener ? 	el.addEventListener( tipo , fn, false ) : 
		el.attachEvent( 'on' + tipo, function(e){
			if( !e ){e = window.event}
			if( !e.preventDefault ){
				e.preventDefault = function(){
					this.returnValue = false
				}
				e.stopPropagation = function(){
					this.cancelBubble = true
				}
			}
			fn.call(el, e )
		})
	},
	
	// Función para añadir eventos
	addEvent = function( el, tipo, fn ){
		// Si son varios elementos, añadimos un evento a cada uno
		if ( el.length ){
			forEach( el, function( elm ){
				evSingle( elm, tipo, fn )
			});
		// Si sólo es uno, usamos la función anterior
		}else{
			evSingle( el, tipo, fn )
		}
	},
	// Seleccionar los elementos de una etiqueta según si su atributo coincide por un regExp
	// Rel es un regexp, y las extensiones pueden ser "g","i","m", o una combinación ("gi")
	selectPorAttr = function( tag, rel, relExt, attr ){
		var elementos = document.getElementsByTagName( tag ),
			reg = new RegExp( rel || '' , relExt ),
			res = [];
		
		forEach( elementos, function( el ){
			if ( reg.test( el.getAttribute( attr ) || '' ) ) res.push( el );
		});
		
		return res
	},
	// Función para retornar un elemento según la url. De aquí sacamos el elemento que insertaremos en la ventana
	getContent = function( href ){
		var el,
			win = winSize(),
			w,h;
		// Inline. Éste es uno de los problemas. Ciertas implementaciones devuelven la URL completa (http://lapaginaactual/#laId), y otras sólo la id (#laId)
		// <a href="#unaIdCualquiera">rel="modalBox"</a>
		// No queremos que hallan ni barras ni espacios.
		if( (/^#[^\/\s]+$/i).test( href ) ){
			// Creamos un div y le damos anchura
			el = create('div');
			el.style.width = modalBox.config.inlineWidth + 'px'
			// Su html será el del elemento de referencia
			el.innerHTML = document.getElementById( href.substring( 1 ) ).innerHTML
		// Vídeo(youtube/vimeo)
		} else if ( (/youtube\.com(\/v\/|.*watch\?v)/).test(href) || (/vimeo\./).test( href ) ){
			el = create('iframe',{
				// Creamos un iframe, con la dirección concreta para ese vídeo
				"src": /vimeo\./.test(href) ? ('http://player.vimeo.com/video/'+  href.substring( href.lastIndexOf('\/') + 1 )) :
					// Con youtube nos guiamos por una serie de condicionales, ya que la url puede ser
					  // http://youtube.com/v/ID
					  // http://youtube.com/watch?v=ID&(otros parámetros)
					('http://www.youtube.com/embed/'+
						href.substring(
							href.indexOf("watch?v=") === -1 ? (href.indexOf("/v/") + 3): (href.indexOf("watch?v=") + 8), 
							href.indexOf("/v/") !== -1 ? (href.indexOf("?") === -1 ? undefined: href.indexOf("?")) :href.indexOf("&") !== -1  ? href.indexOf("&") : undefined ) + "?autoplay=1"),
				"type": "text/html",
				"width": "640",
				"height": "390",
				"frameborder":"0",
				"allowtransparency": "true"
			})
		// Imagen
		} else if( /\.(png|jpe?g|gif)$/i.test( href ) ){
			// Símplemente una imagen con la url del enlace
			el = create('img');
		// Iframe => Por defecto 70% de ancho y alto
		} else if( /(\?|&)iframe=true/.test(href) ){
			// Calculamos la anchura
			w =  href.match(/(\?|&)width=([0-9]+%?)(&|$)/);
			// Y la altura
			h = href.match(/(\?|&)height=([0-9]+%?)(&|$)/);
			el = create('iframe',{
				// Su url será la del enlace sin los parámetros del iframe
				"src": href.replace(/(\?|&)(height|width|iframe)=(true|[0-9]+%?)/g,""),
				"width": w !== null ?
					// Si hay anchura especificada,
					(/%$/.test(w[2]) ? 
						// Si es un porcentaje tenemos que calcularlo según la ventana
						parseFloat(w[2]) * win.width /100: 
						// Si no, tomamos el valor directamente
						w[2]) :
					// Si no hay anchura, 70% de la pantalla
					win.width * 0.7,
				// Para la altura la comprobación es similar.
				"height": h !== null ? 
					(/%$/.test(h[2]) ? parseFloat(h[2]) * win.height/100 : h[2]): win.height * 0.7,
				"frameborder": "0",
				"allowtransparency": "true"
			})
		}
		return el
	},
	// Objeto usado para el método trigger (que implementé hace relativamente poco), y que permite usar la ventana directamente desde javascript
	// modalBox.trigger('url')
	empty = {
		getAttribute: function(){return ''}
	},
	getHref = function(el){
		if( isIE ){
			return el.getAttribute("href", 2)
		}
		return el.getAttribute("href")
	}
	
	// El objeto global
	window.modalBox = {
		config: {
			// Queremos que al hacer click en la capa se cierre la ventana
			overlayClick:true,
			// Queremos que se muestre la navegación
			showNavi:true,
			// Ahora mismo es inútil (todavía no implementada), estará en breve. 
			showGalName: true,
			// Ancho para los elementos inline
			inlineWidth:600,
			// Orden de los elementos (1,2,3,4)
			orden:['title','content','caption','navi'],
			// Textos
			textoAnterior: "Anterior",
			textoSiguiente: "Siguiente",
			textoCerrar: "X",
			// Usar otro atributo (data-rel), etc
			atributo: "rel"
		},
		// Sel es el selector (la etiqueta por la que buscaremos o el selector completo si usamos jQuery y sólo configuramos éste argumento)
		// rel es el valor que tomará el atributo configurado que, como he dicho antes, es un RegEx
		// ex son las posibles opciones del RegEx("g","i","m")
		init: function( sel, rel , ex){
			var argEsUno = arguments.length === 1,
			// Permitimos usar jQuery y Sizzle
			els = window.jQuery && argEsUno ? jQuery( sel ).get() : window.Sizzle && argEsUno ? Sizzle( sel ) : selectPorAttr( sel, rel, ex, this.config.atributo )
			
			// Si hay elementos previos concatenamos
			this.els = this.els ? this.els.concat(els) : els
			
			// Ejecutamos los eventos
			this.eventos()
			return this
		},
		eventos: function(){
			var esto = this;
			// A cada elemento le agregamos un evento, que determinará si está en una galería, y creará la ventana
			forEach( this.els, function( el, i ){
				addEvent(el, 'click', function(e){
					esto.createGallery(this, i)
					esto.loadModal()
					e.preventDefault()
					e.stopPropagation()
				})
			})
			return this
		},
		// Crea la galería basándose en el elemento y recibiendo la posición global en el caso de que no haya
		createGallery: function(el, globalPos){
			var esto = this,
				//RegEx para identificar la galería
				//Los paréntesis son para poder acceder al nombre literal (sin corchetes)
				galReg = /\[(.*)\]/,
				galName = el.getAttribute(this.config.atributo).match(galReg),
				gal = [];
			// No hay galería
			if( galName  === null ){
				// La galería es global
				this.currentGallery = this.els; 
				this.currentElFromGal = globalPos;
				// No estamos en la galería
				this.inGallery = this.galName = false; 
				return false
			}
			forEach(this.els, function( elem, i){
				var attr = elem.getAttribute( esto.config.atributo )
				//Comprobamos qué elementos están en la galería
				galReg.test(attr) && attr.match( galReg )[0] === galName[0] && gal.push(elem);
				//Marcamos la posición actual
				if( elem === el ) esto.currentElFromGal = gal.length -1
			})
			//indicamos la galería
			this.currentGallery = gal
			//Nombre de la galería
			this.galName = galName[1]
			this.inGallery = true;
			return false;
		},
		loadModal:function(custom, href){
			var esto = this,
				current = !custom ? this.currentGallery[ this.currentElFromGal ] : empty,
				el,resize;
			!this.modal && this.createMarkup()
			this.modal.className = this.modal.className.replace("cargado","")
			var currentHref =  (href && custom) ? href : getHref(current);
			
			forEach(this.config.orden, function(obj){
				//Usamos "==" en vez de "===" porque la string no es exactamente del mismo tipo
				obj == 'navi'? 
					esto.setNavi(): obj == 'title' ? 
						esto.setTitle(custom)	: obj == 'caption' ? 
						//getAttribute nos devuelve el href tal y como es, con current.href nos devuelve la dirección completa
							esto.setCaption(custom): 
								esto.setContent( getContent(currentHref), currentHref );
			})
			el = this.mainEl

			el.tagName !== 'IMG' && this.setDimensions()
			
		},
		trigger: function(href){
			this.loadModal(true, href)
		},
		setTitle: function(custom){
			this.title && remove(this.title)
			var current = !custom ? this.currentGallery[ this.currentElFromGal ] : empty,
				title = this.title = create('div', {"id":'modal-title',"class":"title"}),
				textoTitulo = current.title || current.getAttribute('data-title');
			title.innerHTML = textoTitulo || '';
			this.modal.appendChild(title)
		},
		setCaption:function(custom){
			this.caption && remove(this.caption)
			var current = !custom ? this.currentGallery[ this.currentElFromGal ] : empty,
				caption = this.caption = create('div',{"id":"modal-caption", "class": "caption"}),
				textoCaption = current.alt || current.getAttribute('data-caption');
			caption.innerHTML = textoCaption || ''
			this.modal.appendChild(caption)
		},
		setNavi:function(){
			this.navi && remove(this.navi)
			var esto = this,
				config = esto.config,
				naviDiv = esto.navi = create('div',{"id":"modal-navi","class":"navi"}),
				naviNext = create('a',{"id": 'modal-next', "class":"next"}),
				naviPrev = create('a', {"id": "modal-prev" ,"class": "prev"}),
				naviClose = create( 'a', {"id": "modal-close","class": "close"}),
				clear = create( 'div' );
			clear.style.clear = "both"
				
			naviNext.href = naviPrev.href = naviClose.href = '#'
			naviNext.setAttribute('data-dir','next')
			naviPrev.setAttribute('data-dir','prev')
			naviNext.innerHTML = config.textoSiguiente
			naviPrev.innerHTML = config.textoAnterior
			naviClose.innerHTML = config.textoCerrar

			addEvent([naviNext,naviPrev], 'click', function(e){
				if( this.getAttribute('data-dir') === 'next' ){
					esto.currentElFromGal += 1
				}else{
					esto.currentElFromGal -= 1
				}
				esto.loadModal()
				e.preventDefault()
			})

			addEvent( naviClose, 'click', function(e){
				esto.close()
				e.preventDefault()
			})
			//Si estamos en una galería, mostraremos la navegación
			if( esto.inGallery ){
				if( config.showNavi && esto.currentElFromGal !== 0 ){
					naviDiv.appendChild(naviPrev)
				}
				if( config.showNavi && esto.currentElFromGal !== this.currentGallery.length - 1 ){
					naviDiv.appendChild( naviNext )
				}
			}
			naviDiv.appendChild( naviClose )
			naviDiv.appendChild( clear )
			
			this.modal.appendChild( naviDiv )
		},
		setContent: function(el, currentHref){
			this.content && remove(this.content)
			var esto = this,
			win = winSize(),
			contentDiv = this.content = create('div',{"id": 'modal-content', "class": "content"})
			
			if(el.tagName === 'IMG'){
				//Creamos un div oculto para ver las dimensiones de la imagen
				dummy = create('div',{style:{visibility:"hidden",position:"absolute",top:"-9999px",left:"-9999px",zIndex:"-999"},id:'dummy'})
				body.appendChild(dummy)
				//Ponemos offsetHeight/Width porque IE <= 8 devuelve "auto"
				dummy.appendChild(el)
				//Tiene que estar cargada para que de valores correctos
				imageOnLoad = function(){
					log('Evento ejecutado en imagen')

					var st = {
						width: el.offsetWidth,
						height: el.offsetHeight
					}, resized = false,resize;
					log(st.width,st.height)
					//Necesario configurar las 2 porque IE no reajusta por defecto
					if(st.height > win.height){
						el.height = win.height * 0.7
						el.width = el.height * st.width / st.height;
						resized = true
					}else if(st.width > win.width){
						el.width = win.width * 0.7
						el.height = el.width * st.height / st.width;
						resized = true
					}					
					if(resized){
						resize = create('a',{
							"href":'javascript:;',
							"class":'modal-resize'
						})
						resize.innerHTML = '+'
						addEvent(resize,'click',function(e){
							el.style.visibility = 'hidden'
							el.removeAttribute('width')
							el.removeAttribute('height')
							esto.setDimensions()
							e.preventDefault()
						})
						esto.navi ? esto.navi.insertBefore(resize,esto.navi.lastChild) : setTimeout(function(){	esto.navi.insertBefore(resize,esto.navi.lastChild)},1000)
					}
					contentDiv.appendChild(el)
					remove(dummy)
					esto.setDimensions()
					navegadorAntiguo && el.detachEvent('onload',imageOnLoad)
				}
				addEvent(el,'load',imageOnLoad)
				el.src = currentHref;
			}
			this.modal.appendChild(contentDiv);
			el.tagName === 'IFRAME' && (el.style.visibility = 'hidden');
			el.tagName !== 'IMG' && contentDiv.appendChild(el);
			!this.visible && this.show();
			this.mainEl = el;
		},
		show:function(){
			body.appendChild(this.modal)
			body.appendChild(this.overlay)
			this.visible = true
		},
		close: function(){
			forEach( this.content.children, function(child){
				//Para evitar problemas al borrar iFrames en IE
				child.style && (child.style.display = "none")
				remove( child )
			})
			remove(this.modal)
			animar(this.overlay,{opacity:0}, 600, function(){
				remove(this)
			})
			this.inGallery = false;
			this.visible = false;
			//IE NOS OBLIGA A REHACER LA VENTANA
			this.overlay = this.modal = undefined
		},
		createMarkup: function(){
			var esto = this,
			win = winSize(),
			style;
			this.overlay = create('div', 'modal-overlay');
			this.modal = create('div', 'modalBox');
			style = this.modal.style
			style.width = style.height = '30px';
			style.bottom = style.right = "auto"
			style.top = win.scrollTop + win.height/2 + 'px';
			style.left = win.width / 2 + 'px';
			style.marginTop = style.marginLeft = '-15px'
			
			if( this.config.overlayClick ){
				this.overlay.onclick = function(){esto.close()}
			}
		},
		setDimensions:function(){
			var esto = this,
				modal = this.modal,
				est = estilo(modal),
				content = this.mainEl,
				style = this.modal.style,
				h = content.offsetHeight,
				w = content.offsetWidth;

			animar(modal, {"width": w, "marginLeft": - w/2 - parseInt(est.paddingLeft,10), opacity: 1}, 600, function(){
				forEach( [esto.navi, esto.title, esto.caption], function(el){
					var s = estilo(el)
					s.position !== 'absolute' && (s['cssFloat'] || s['float']) === 'none' && (h += el.offsetHeight )
				})
				animar(modal,{height:h, marginTop: -h/2 - parseInt(est.paddingTop,10)},600,function(){
					style.overflowX = style.overflowY = esto.mainEl.style.visibility = 'visible'
					modal.className += ' cargado'
				})
				
			});
		}
	}
})(window,document)