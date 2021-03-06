import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from '../templates/questionList.html';
import Question from './question';
import { Meteor } from 'meteor/meteor'

import { Questions } from '../publishers/questionPublisher.js';
import QML2HTML from '../interpreter/QML2HTML.js';

class QuestionListController{
	constructor($scope) {
		$scope.viewModel(this);     
		
		this.toDelete;
		
		/*Materilize collapsible initialization*/
		$(document).ready(function(){
			$('.collapsible').collapsible({
			  accordion : true 
			});
		});      		
		
        $(document).ready(function(){
			// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
			$('.modal-trigger').leanModal();
		});				
		
		this.subscribe('questions');
	
		this.helpers({
			questions() {
				return Questions.find({"owner" : Meteor.userId()}, {"sort" : [['createdAt', 'desc']]});
			}							
		});		
	}
	
	getQuestionDetails(QMLtext){	
debugger;	
		var questionDetails = QML2HTML(QMLtext);
		if(questionDetails)
			return questionDetails;
		else
			console.log("Error retrieving question details");
	}		
	
	deleteQuestion(question){
		if(question){			
			Meteor.call("questions.remove", question, function(error, result) {
				if (error)
					QzMessage.showText(0, error);
				else{					
					if(result)
					{						
						QzMessage.showText(2, "Your question has been removed!");
					}
					else
						QzMessage.showText(0, "Can't remove question");											
					
					this.toDelete = undefined;
				}
			});
		}
		else{
			QzMessage.showText(0,"Error removing question");
		}
	}
	
	openAlertQuestion(questionId){		
		this.toDelete = questionId;					
		$('#questionModal').openModal();
	}
		
}

export default angular.module('questionList', [
  angularMeteor,  
  Question.name
])
  .component('questionList', {
    templateUrl: 'imports/templates/questionList.html',        
    controller: ['$scope', QuestionListController]
  });
