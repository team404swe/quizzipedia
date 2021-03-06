import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from '../templates/userProfile.html';
import questionList from '../controllers/questionList';
import quizList from '../controllers/quizList';
import { Quizzes } from '../publishers/quizPublisher.js';
import { Questions } from '../publishers/questionPublisher.js';

class UserProfileController{
	constructor($scope) {
		$scope.viewModel(this);
		
		$scope.$on('$viewContentLoaded', function() {
			init();
		});
		this.allowDelete = true;
		
		/*Materialize collapsible initialization*/
		$(document).ready(function(){
			$('.collapsible').collapsible({
			  accordion : true 
			});
		});     						
	}
	
	getQuestionsNum(){
		return Questions.find({"owner" : Meteor.userId()}).count();		
	}
	
	getQuizNum(){
		return Quizzes.find({"owner" : Meteor.userId()}).count();
	}
	
	getUsername(){
		return Meteor.users.findOne({"_id" : Meteor.userId()}).username;
	}	
	
	changePhoto(){
		
	}
	
}

export default angular.module('userProfile', [
  angularMeteor,
  questionList.name,
  quizList.name
])
  .component('userProfile', {
    templateUrl: 'imports/templates/userProfile.html',
    controller: ['$scope', UserProfileController]
  });
