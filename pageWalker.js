class __PageWalker {
	constructor(elem){
		this.listeners = {
			'*' : {
				arr : [],
			},
			'!' : {
				arr : [],
			}
		};
		this.getters = {};
		this.afterViewEvents = [];
		this.elem = typeof elem === String ?
		document.querySelector(elem) : elem;
		this.init();
		return this;
	}
	init(){
        window.onload = () => {
			if(app.getHash()){
				this.route();
			} else {
				app.routeTo('/');
			}
        }
		window.onhashchange = () => {
			if(app.getHash()){
				this.route();
			} else {
				app.routeTo('/');
			}
		}
	}
	route(){
		let keyArr = this.getHash().split('#');
		let key = !(keyArr[0].lastIndexOf('/') == (keyArr[0].length - 1)) ? keyArr[0] + '/' : keyArr[0];	
		if(this.listeners.hasOwnProperty(key)){
			let exist = this.listeners[key];
			if(Object.keys(exist).length){
				this.listeners[key].callback.forEach((el) => {
					el.call(this.listeners[key]);
				});
			};
			this.any();
			this.scrollToView();
			return this;
		}
		let Lkey = this.findObj(key);
		if(key && Lkey){
			let keyArr = key.split('/');
			let keyArrObj = (Lkey.split('/'));
			let isTheSame = this.compare(keyArr, keyArrObj);
			if(isTheSame){
				let newObj = this.buildObj(keyArr, keyArrObj);
				this.listeners[Lkey].params = newObj;
				this.listeners[Lkey].callback.forEach((el) => {
					if(el){
						el.apply(this.listeners[Lkey], Object.values(newObj));
					}
				});
				this.any(Object.values(newObj));
				return this;
			}
	    }
		this.misc();
        return this;
	}
	misc(){
		this.any();
		this.notFound();
		this.scrollToView();
	}
	notFound(arr){
		this.listeners['!']['arr'].forEach((e, i) => {
			e.callback.forEach((el, ix) => {
				el.apply(this.listeners['!'][i], arr ? arr : []);
			});
		});
	}
	compare(arr1, arr2, get){
		let len = arr1.length == arr2.length;
		let p = arr2.slice(1, -1).every((el) => {
			return el.includes('{') && el.includes('}') && !(el.includes(':'))
		});
		if(p && arr1.length == arr2.length){
			return true;
		};
	  	if(arr1.length && arr2.length){
		  	let bool = false;
		  	let b = arr2.map((el, i) => {
			  	if(el.includes('{') && el.includes('}')){
				  el = el.slice(1, -1);
				}
				if(el.includes(':')){
					bool = true;
					let regItem = el.split(':')[1];
					let reg = new RegExp('^' + regItem + '$');
					return (reg.test(arr1[i]));
				} else {
					if(get){
						if(el.includes('{') && el.includes('}')){
							bool = true;
							el = el.slice(1, -1);
							return el == arr1[i];
						} else {
							return true;
						}
					} else {
						return (el == arr1[i]);
					}
				}
		  	});

		  	b = b.every((el) => {
			 	return el == true;
		 	});
			if(get) return b && len;
			if(!bool) return len && arr1.join('') == arr2.join('');
			if(p) return p && len;
			return b && len;
	  	}
	  	return false;
	}
	findObj(urlH, get){
		let tag = get ? 'getters' : 'listeners';
		let listenersKeys = Object.keys(this[tag]);
		let hashArr = urlH.split('/');
		let arr;
		let key;	
        for(let i = 0; i < listenersKeys.length; i++){
			let listenArr = listenersKeys[i].split('/');
			let h = [];
			arr = [...hashArr];
        	if(listenersKeys[i] == '*' || listenersKeys[i] == '!'){
				continue;
			}
			let a = listenArr;
			let b = a.filter((el) => {
				return !(el.includes('{'))
			});
            for(let i = 0; i < arr.length; i++){
                for(let v = 0; v < b.length; v++){
                  if(arr[i] == b[v]){
					   h.push(arr[i]);
				  }
				}
			}
			if(JSON.stringify(b) == JSON.stringify(h)){
                let bool = this.compare(hashArr, listenArr);
				if(bool){
                    key = listenersKeys[i];
				} else if(tag == 'getters'){
					key = listenersKeys[i];
				}
			}
			else if(this.compare(hashArr, listenArr)){
				let bool = this.compare(hashArr, listenArr);
				if(bool){
					key = listenersKeys[i];
				} else if(tag == 'getters'){
					key = listenersKeys[i];
				}
				return key;
			}
			else{
				if(hashArr.length == listenArr.length){
					let p = listenArr.slice(1, -1).every((el) => {
					if(el.includes('{') && el.includes('}') && !(el.includes(':'))){
						key = listenersKeys[i];
					}
				});
					return key;
				}
				if(b.includes('*')){
					let k = (listenersKeys[i].slice(0, -1));
					let bool = this.compare(hashArr, k.split('/'));
					if(bool){
						key = listenersKeys[i];
					} else if(tag == 'getters'){
						key = listenersKeys[i];
					}
				}

			}

            
		}
		return key ? key : false;
	}
	buildObj(arr1, arr2){
		let obj = {};
		let d = [... arr1];
		let e = [... arr2];
		let filter1 = arr1.filter((el, i) => {
			return el != arr2[i];
		});
		let filter2 = e.filter((e, i) => {
			return e != d[i];
		});
		filter2.forEach((el, i) => {
			if(el.includes(':')){
				obj[el.slice(1,-1).split(':')[0]] = filter1[i];
			} else if(el.includes('}') && el.includes('{') && !(el.includes(':'))){
				obj[el.slice(1,-1)] = filter1[i];
			} else {
				obj[el] = filter1[i];
			}
		});
		return (obj);
	}
	
	any(arr){
        let hash = this.getHash();
		arr = arr ? arr : (hash ? hash.split('/') : arr);
		let slice = arr ? arr.slice(1) : arr; 
		arr = arr ? slice : ['/'];
        let obj = Object.keys(this.listeners['*']);
		obj.forEach((e, i) => {
			if(e == 'arr'){
				this.listeners['*'][e].forEach((el, ix) => {
					if(el == 'callback'){
						this.listeners['*'][e][ix].callback.forEach((fn) => {
							fn.apply(this.listeners['*'][e][ix], arr);
						});
					}
				});
			}
			else {
				hash = !(hash.lastIndexOf('/') == (hash.length - 1)) ? hash + '/' : hash;
				if(hash.includes('//') && hash.lastIndexOf('//') == (hash.length - 2)){
					hash = (hash.slice(0, -1));
				}
				let newObj = this.buildObj(hash.split('/'), e.split('/'));
				if(this.compare2(hash, e)){
					Object.keys(this.listeners['*'][e]).forEach((el) => {
						if(el == 'callback'){
							this.listeners['*'][e][el].forEach((fn, ixx) => {
								fn.apply(this.listeners['*'][e][el][ixx], Object.values(newObj));
							});
						}
					});
				}
			}
		});
    }
    compare2(hash, input){
		let arr1;
		let arr2;
		if(hash.constructor.name == 'String' || input.constructor.name == 'String'){
			arr1 = hash.split('/');
			arr2 = input.split('/');
		}
		if((arr1 ? arr1.length : hash.length) > (arr2 ? arr2.length : input.length)){
			arr1.length = arr2.length;
			return (hash.constructor.name == 'Array' ? hash.join('') : hash).includes(input) || this.compare(arr1 || hash, arr2 || input);
		}
    }
	
	view(arg, container){
		let cont = container ? document.getElementById(container) : this.elem;
		cont.innerHTML = arg;
		this.contentReady();
		return this;
	}
	getViewId(){
		let keyArr = this.getHash().split('#')[1];
		return keyArr ? '#' + keyArr : false;
	}
	scrollToView(id){
		let el = id || document.querySelector(this.getViewId());
		if(el){
			el.scrollIntoView();
		}
	}
	contentReady(){
		let id = this.getViewId();
		if(id){
			let elem = document.querySelector(id);
			this.scrollToView(elem);
		}
		this.execAfterViewEvents();
		this.activateform();
	}
	getHash(){
		let returnhash;
		let urlhash = location.hash;
		let hashIndex = urlhash.lastIndexOf('/');
	     returnhash = returnhash ?
	     returnhash.slice(1) : urlhash.slice(1);
	     return returnhash;
	}
    setTitle(title){
        document.title = title;
        return this;
	}
	hasTitle(){
		return document.title || false;
	}
	listen(pattern, ...callback){ 
		pattern = !(pattern.lastIndexOf('/') == (pattern.length - 1)) ? pattern + '/' : pattern;
		let params = {};
		let getHash = this.getHash.bind(this);
		let regArr = pattern.split('/').filter((el) => { return el});
		if(regArr[regArr.length - 1] == '*'){
            let n = '/' + [... regArr.slice(0, -1)].join('/');
			this.listeners['*'][n] = {
				callback,
				getHash,
				params
			}
		}
        if(regArr[0] == '*' || regArr[0] == '!'){
            let key = regArr[0] == '*' ? "*" : '!';
            let obj = {
            callback,
            getHash,
            params
            }
            this.listeners[key]['arr'].push(obj);
            return this;
        }
		if(!pattern.includes('{') && !pattern.includes('}')){
			this.listeners[pattern] = {
				callback,
				getHash,
				params
			}
			return this;
		}
        this.listeners[pattern] = {
            callback,
            getHash,
            params
        }
	    return this;
	}

	getRoutes(){
		return Object.keys(this.listeners).filter((route) => {
			return (route !== '*' && route !== '!');
		})
		
	}
	routeTo(url){
		location.hash = url;
		return this;
	}
	attachEvent(event){
		this.afterViewEvents.push(event);
		return this.afterViewEvents.length - 1;
	}
	detachEvent(eventId){
		let events = this.afterViewEvents;
		for(let i = 0; i < events.length; i++){
			if(eventId == i){
				this.afterViewEvents.splice(eventId, 1);
				break;
			}
		}
	}
	execAfterViewEvents(){
		this.afterViewEvents.forEach((event) => {
			event();
		});
	}


	
	
	//=> below methods  are deprecated and will be removed in future versions of the library;

	get(pattern, ...callback){
		pattern = pattern.slice(1);
		let params = {};
		let regArr = pattern.split('/').filter((el) => { return el});
		if(regArr[0] == '*'){
			let key = regArr[0];
			let obj = {
			 callback,
			 params,
			 pattern
			}
			this.getters[key].push(obj);
			return;
		}
		this.getters[pattern] = {
			callback,
			params,
			pattern
			}
			return ;
	}
	slide(el){
		let ardd = (document.getElementById('cont'));
		ardd.classList.add('opacity');
			setTimeout(() => {
				ardd.classList.remove('left');
				setTimeout(() => {
				ardd.classList.remove('opacity');
						ardd.classList.add('left');
				},500);
				ardd.classList.remove('left');
				
			},0);
			return this;

		}
	slideOut(el){
		let ardd = (document.getElementById('cont'));
		ardd.classList.remove('left');
		setTimeout(() => {
			ardd.classList.add('right');
		},1300);
	}
	activateform(){
		let f = document.forms;
		for(let i = 0; i < f.length; i++){
			f[i].addEventListener('submit', (ev) => {
				event.preventDefault();
				let currentRet = this.form(event.target);
				let keyy = this.currentRet['get'];
				let Lkey = this.findObj(keyy, 'get');
			    if(Lkey){
                    let keyArr = keyy.split('/');
                    let keyArrObj = (Lkey.split('/'));
					let check = this.compare(keyArr, keyArrObj, 'get');
                    if(check){
                        let newObj = this.buildObj(keyArr, keyArrObj);
                        let reg = this.getters[Lkey]['reg'];
                        this.getters[Lkey].params = newObj;
                        if(Object.keys(newObj)[0]){
                            this.getters[Lkey].callback.forEach((el) => {
                                el.apply(this.getters[Lkey], Object.values(newObj));
                            });
                            delete this.getters[Lkey].callback;
                            this.any(Object.values(newObj));
                        }
                        return this;
			        };
		        }
	        });
        }
        return this;
	}
	form(form){
		let obj = {};
	    let inputs = [... form.elements].filter((el) => {
		return el['type'] !== 'submit';
	    });
        inputs.forEach((el) => {
            obj[el['name']] = el['value'];
        });
	    let values = Object.values(obj);
        let str = '';
        let str2  = '';
        Object.keys(obj).forEach((el, i) => {
            str +=  el + '/' +  values[i] + '/';
            str2 +=  el + '=' +  values[i] + '&';

        });
        let ret = {
            'get' :  str.slice(0,-1),
        'url' : str2.slice(0,-1),
        'obj' : obj
		}
        this.currentRet = ret;
        return ret;
    }
}

