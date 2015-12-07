$.material.init();
(function () {
	'use strict';
	//подключение модулей различных страниц
	angular
		.module('ngFit', [
				'ngRoute',
				'ngFit.fitfire.service',
				'ngFit.main',
				'ngFit.edit',
				'ngFit.trainings',
				'ngFit.about',
				'ngFit.contact',
				'ngFit.navbar',
				'youtube-embed'
				])
		.constant('FIREBASE_URL', "https://yanfit.firebaseio.com/")
		.config(Config);
		Config.$inject = ['$routeProvider','$locationProvider','$logProvider'];
		//общий конфиг приложения
		function Config($routeProvider,$locationProvider,$logProvider) {
				$routeProvider.
					otherwise({redirectTo: '/'});
				$locationProvider.html5Mode(true);//возможность убрать # в url Благодаря html5 тегу base в секции head
				$logProvider.debugEnabled(true); //включение дебага в нашем приложениии
		}
})();

;(function(){
	'use strict';
	angular
		.module('ngFit.fitfire.service',['firebase'])
		.service('fitfire', fitfire);
		fitfire.$inject = ['$rootScope','FIREBASE_URL','$firebaseObject','$firebaseArray'];
		function fitfire($rootScope,FIREBASE_URL,$firebaseObject,$firebaseArray){
			var vm = this;

			vm.db = new Firebase(FIREBASE_URL);
			var db_obj = $firebaseObject(vm.db);
			var db_arr = $firebaseArray(vm.db);

			var users_obj = vm.db.child('Users');
			var users_arr = $firebaseArray(users_obj);

			var exercises_obj = vm.db.child('Exercises');
			var exercises_arr = $firebaseArray(exercises_obj);

			db_obj.$loaded(function(){
				vm.db_obj = db_obj;					
			});

			vm.isUser = function(name){
				var is = false;
				users_obj.once("value",function(snapshot){
					var data = snapshot.val();
					for (var user in data){
						if (data[user].name == name){
							is = true;
						}
					}
				});
				if (!is){
					vm.addUser({"name":name,"age":"","real_name":"","trainings":""});
				}
			};
			vm.getUsers = function(cb){
				return users_arr.$loaded(cb);
			};
			vm.getExercises = function(cb){
				return exercises_arr.$loaded(cb);
			};
			vm.addUser = function(_user){
				console.log(_user);
				users_obj.push(_user);
			};
			vm.addExercise = function(_exercise,_user){
				_exercise.added = _user;
				exercises_obj.push(_exercise);
			};
			vm.removeExercise = function(_exercise){
				var exercise_url = FIREBASE_URL+'Exercises/'+_exercise.$id;
				var removing_exercise = new Firebase(exercise_url);
				removing_exercise.remove(

					function(error) {
  if (error) {
    console.log('Synchronization failed');
  } else {
    console.log('Synchronization succeeded');
  }
}
				);
			};
		};
})();
;(function(){
	"use strict";
	/*angular
		.module('ngFit.auth', ['firebase'])
		.controller('AuthCtrl',AuthCtrl);

		AuthCtrl.$inject = ['$scope','$rootScope','$firebaseAuth'];

		function AuthCtrl($scope,$rootScope,$firebaseAuth){
			var ref = new Firebase("https://yanfit.firebaseio.com");
		    var auth = $firebaseAuth(ref);

		    $scope.login = function() {
		      $scope.authData = null;
		      $scope.error = null;

		      auth.$authAnonymously().then(function(authData) {
		        $scope.authData = authData;
		      }).catch(function(error) {
		        $scope.error = error;
		      });
		    };
		}
		*/
})();

;(function(){
	'use strict';
	angular
		.module('ngFit.contact',['ngRoute'])
		.config(configContact)
		.controller('ContactCtrl', ContactCtrl);

	ContactCtrl.$inject = ['$scope','$rootScope'];

	function ContactCtrl($scope,$rootScope,$log){
		var vm = this; //чтобы не путаться в областях видимости

		$rootScope.curPath = 'contact';
		vm.title = "Контакты";
	}

	configContact.$inject = ['$routeProvider'];

	function configContact($routeProvider){
		$routeProvider.
			when("/contact",{
				templateUrl: "app/contact/contact.html",
				controller: 'ContactCtrl',
				controllerAs: 'vm'
			});
	}
})();
;(function(){
	'use strict';
	angular
		.module('ngFit.about',['ngRoute'])
		.config(configAbout)
		.controller('AboutCtrl',AboutCtrl);

	AboutCtrl.$inject = ['$scope','$rootScope'];

	function AboutCtrl($scope,$rootScope,$log){
		var vm = this; //чтобы не путаться в областях видимости(не забывать в конфиге про контроллер эз)

		$rootScope.curPath = 'about';

		vm.title = "О нас";
	}

	configAbout.$inject = ['$routeProvider'];

	function configAbout($routeProvider){
		$routeProvider.
			when("/about",{
				templateUrl: "app/about/about.html",
				controller: 'AboutCtrl',
				controllerAs: 'vm'
			});
	}
})();
;(function(){
	'use strict';
	angular
		.module('ngFit.edit',['ngRoute'])
		.config(configEdit)
		.controller('EditCtrl', EditCtrl);
	EditCtrl.$inject = ['$scope','$rootScope','fitfire'];
	function EditCtrl($scope,$rootScope,fitfire){
		var vm = this; //чтобы не путаться в областях видимости
		vm.saveUser = function(){
			fitfire.getUsers(function(_d){
				vm.users = _d;
				var currentUser = fitfire.db.getAuth();
				for (var us in vm.users){
					if (vm.users[us].name == currentUser.github.username){
						fitfire.db.child('Users/'+vm.users[us].$id).update({"name":vm.users[us].name,"age": vm.age,"real_name":vm.real_name,"trainings":""});
					}
				}
			});
		};
		$rootScope.curPath = 'edit';
	}

	configEdit.$inject = ['$routeProvider'];

	function configEdit($routeProvider){
		$routeProvider.
			when("/edit",{
				templateUrl: "app/edit/edit.html",
				controller: 'EditCtrl',
				controllerAs: 'vm'
			});
	}
})();
;(function(){	
	'use strict';
	angular
		.module('ngFit.main',['ngRoute'])
		.config(configMain)
		.controller('MainCtrl', MainCtrl);

	MainCtrl.$inject = ['$scope','$rootScope','$log','fitfire'];

	function MainCtrl($scope,$rootScope,$log,fitfire){
		$rootScope.login = false;
		var vm = this; //чтобы не путаться в областях видимости

		fitfire.getUsers(function(_d){
			vm.users = _d;
		});
		fitfire.getExercises(function(_d){
			vm.exercises = _d;
		});
		vm.all = true;
		vm.user = {
			name : '',
			age : 0,
			real_name: '',
			trainings: null
		};
		vm.filters = {};
		vm.exercise = {
		};
		var currentUser = fitfire.db.getAuth();
		vm.toggleExercises = function(event){
			if (event){
				event.stopPropagation();
				event.preventDefault();	
			}
			if (vm.all){
				vm.filters.added = vm.name;
			}
			else{
				vm.filters.added = '';
			}
			vm.all = !vm.all;	
			console.log(vm.filters.added);
		};
		vm.addUser = function(){
			fitfire.addUser(vm.user);
		};
		vm.addExercise = function(){
			if (vm.check()){
				vm.exercise = {};
				fitfire.addExercise(vm.exercise,vm.name);
			}
		};
		vm.removeExercise = function(_exercise){
			if (vm.check()){
				fitfire.removeExercise(_exercise);
			}
		};
		vm.check = function(){
			var currentUser = fitfire.db.getAuth();
			if (currentUser){
				vm.name = currentUser.github.username;
				return true;
			}
			else
				return false;
		};
		$rootScope.curPath = 'main';//что-то вроде глобальной переменной для использования во вьюхах

	}

	configMain.$inject = ['$routeProvider'];

	function configMain($routeProvider){
		$routeProvider.
			when("/",{
				templateUrl: "app/main/main.html",
				controller: 'MainCtrl',
				controllerAs: 'vm'
			});
	}
})();
;(function(){
	'use strict';
	angular
		.module('ngFit.navbar',['ngRoute'])
		.controller('AuthCtrl', AuthCtrl);
	AuthCtrl.$inject = ['$scope','$rootScope','fitfire'];
	function AuthCtrl($scope,$rootScope,fitfire){
		var vm = this;
		$rootScope.curPath = 'navbar';
		vm.name = "";
		vm.handle = function(promise,event){
        	$.when(promise)
            .then(
            	function (authData,event) {
            		if (event){
						event.stopPropagation();
						event.preventDefault();	
					}
        		}, 
        		function (err) {
		            console.log(err);
		        }
		    );
		};
		vm.click = function(event){
			var socialLoginPromise;    
            socialLoginPromise = vm.login(event);
            vm.handle(socialLoginPromise,event);	
		};
		vm.login = function(event){
			var deferred = $.Deferred();
			fitfire.db.authWithOAuthPopup("github", function(error, authData) {
			  if (error) {
			    console.log("Login Failed!", error);
			  }
			  if (authData) {
			  	$scope.$apply(function(){
			  		vm.name = authData.github.username;
			    	console.log("Authenticated successfully with payload:", authData);
			    	deferred.resolve(authData);
			    	fitfire.isUser(vm.name);
			  	});
			  	if (event){
					event.stopPropagation();
					event.preventDefault();	
				}
			  }
			});
			return deferred.promise();
		};
		vm.logout = function(event){
			if (event){
				event.stopPropagation();
				event.preventDefault();	
			}
			fitfire.db.unauth();
		};
		vm.check = function(){
			var currentUser = fitfire.db.getAuth();
			if (currentUser){
				vm.name = currentUser.github.username;
				return true;
			}
			else
				return false;
		}
	}
})();


;(function(){
	'use strict';
	angular
		.module('ngFit.trainings',['ngRoute'])
		.config(configTrainings)
		.controller('TrainingsCtrl', TrainingsCtrl);
	TrainingsCtrl.$inject = ['$scope','$rootScope','fitfire'];
	function TrainingsCtrl($scope,$rootScope,fitfire){
		var vm = this; //чтобы не путаться в областях видимости
		vm.names = [];
		vm.parts = [''];
		vm.selected = [];
		vm.weight = [];
		vm.count = [];
		fitfire.getExercises(function(_d){
				vm.exercises = _d;
				for (var ex in vm.exercises){
					if (typeof vm.exercises[ex] == 'object')
						vm.names[ex] = vm.exercises[ex].full_name;
				}
				console.log(vm.names);
		});
		vm.more = function(){
			++vm.parts.length;
		};
		vm.addTraining = function(){
			vm.part = [
			];
			for (var i = 0; i < vm.selected.length; i++){
				var temp = {};
				temp.exercise = vm.selected[i];
				temp.weight = vm.weight[i];
				temp.count = vm.count[i];
				vm.part.push(temp);
			}
			var time = new Date();
			var curr_date = time.getDate();
			var curr_month = time.getMonth() + 1;
			var curr_year = time.getFullYear();
			time = curr_year + "-" + curr_month + "-" + curr_date;
			fitfire.getUsers(function(_d){
				vm.users = _d;
				var currentUser = fitfire.db.getAuth();
				for (var us in vm.users){
					if (vm.users[us].name == currentUser.github.username){
						var training = {};
						training[time] = vm.part;
						console.log(training);
						fitfire.db.child('Users/'+vm.users[us].$id).update({"name":vm.users[us].name,
																			"age": vm.users[us].age,
																			"real_name":vm.users[us].real_name,
																			"trainings": training});
					}
				}
			});
		};
		$rootScope.curPath = 'trainings';
	}

	configTrainings.$inject = ['$routeProvider'];

	function configTrainings($routeProvider){
		$routeProvider.
			when("/trainings",{
				templateUrl: "app/trainings/trainings.html",
				controller: 'TrainingsCtrl',
				controllerAs: 'vm'
			});
	}
})();