;(function(){
	'use strict';
	angular
		.module('ngFit.fitfire.service',['ngRoute','firebase'])
		.service('fitfire', fitfire);
		fitfire.$inject = ['FIREBASE_URL','$firebaseObject','$firebaseArray'];
		function fitfire(FIREBASE_URL,$firebaseObject,$firebaseArray){
			var self = this;

			var db = new Firebase(FIREBASE_URL);
			var db_obj = $firebaseObject(db);

			db_obj.$loaded(function(){
				self.db_obj = db_obj;					
			});
		};
})();