import { Questions } from '../publishers/questionPublisher.js';

var collection = 'questions';

function getCollection(){
	return collection;
}

function subscribe(controller){
	controller.subscribe(collection);
}
