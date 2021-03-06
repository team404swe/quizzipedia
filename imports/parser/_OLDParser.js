import { Meteor } from 'meteor/meteor'

Meteor.methods({
	
	"parser.check" (QMLTesto) {
		
		if(checkQML(QMLTesto) != null)
			return true;
		else
			return false;

		//questa funzione ritorna true o false controllando sia sintassi QML che la coerenza delle risposte.
		//la sintassi QML generale viene controllata effettivamente da checkText() mentre checkAnswer fa due lavori, chiama
		// checkText() e poi fa il controllo delle risposte. 
		// checkText quindi è una funzione secondaria, la funzione principale è checkAnswer(), ma mi sa che devo cambiare i nomi 
		// per rendere la cosa più intuitiva
	}
	
});

//DEFINIZIONE ESPRESSIONI REGOLARI PER I QUATTRO TIPI DI DOMANDE:
// VF = DOMANDA VERO FALSO
// MU = RISPOSTA MULTIPLA (CON UNA SOLA RISPOSTA ESATTA)
// MX = RISPOSTA MULTIPLA (CON PIÙ RISPOSTE ESATTE)
// AS = DOMANDA ASSOCIAZIONE
		
var VF = /^[\s]*<question>\{(VF|vf|Vf|vF)\}[\s]*[aA][sS][kK]{(.*)[}][\s]*\{(V|v|f|F)\}[\s]*<\/question>[\s]*$/;
var MU = /^[\s]*<question>\{(MU)\}[\s]*[aA][sS][kK]{([^\{]*)}[\s]*((\{(X?[\s]*)\}[\s]*(\S{1,}.*)[\s]*){2,})<\/question>[\s]*$/;
var MX = /^[\s]*<question>\{(MX)\}[\s]*[aA][sS][kK]{([^\{]*)}[\s]*((\{(X?[\s]*)\}[\s]*(\S{1,}.*)[\s]*){2,})<\/question>[\s]*$/
var AS = /^[\s]*<question>\{(AS)\}[\s]*ask{(.*)}[\s]*((([abAB])->([a-zA-Z0-9])[\s]*(\S{1,}.*)[\s]*){2,})<\/question>[\s]*$/;
var OD = /^[\s]*<question>\{(OD)\}[\s]*[aA][sS][kK]{([^\{]*)}[\s]*((\{(\d[\s]*)\}[\s]*(\S{1,}.*)[\s]*){2,})<\/question>[\s]*$/;

var str; // stringa in cui viene memorizzato il testo di input compilato dall'utente
var m; // array in cui viene memorizzata la domanda scomposta secondo l'espressione regolare definita
// per capire il funzionamento della funzione exec() e quindi la variabile m risultante, basta guardare questo sito:
// https://regex101.com/ dove metti l'espressione regolare e il testo che vuoi controllare e vedi come viene suddiviso il testo.
// l'array m quindi contiene tutti i gruppi definiti dalle parentesi tonde delle espressioni regolari

function checkText(testo)
{    
	// AR è l'array che contiene le espressioni regolari definite globalmente fuori dalla funzione
    var AR = [VF, MU, AS, MX, OD];
    var match = false;
    // questo ciclo controlla tramite il metodo exec() se il testo matcha
    // con una delle espressioni regolari definite dell'array AR
    for (var i = 0; i < AR.length && !match; i++)
    {
        if ((m = AR[i].exec(testo)) !== null)
        {
            match = true; 
            if (m.index === AR[i].lastIndex) 
                AR[i].lastIndex++;
        }
    }
    return match;
}

//controlla il tipo della domanda e in base a quello chiama le funzioni seguenti per controllare se c'è almeno una risposta giusta

export default function checkQML(testo)
{
    var question;
    //in pratica prima di fare il controllo sulla coerenza delle risposte controlla che 
    //la sintassi QML sia giusta. Questo è necessario in quanto con le sole espressioni regolari non
    //riesco a fare controlli ulteriori sulle risposte (cioè se per esempio una domanda a risposta multipla a più risposte giuste ha
    // almeno due risposte giuste e non una come la risposta multipla singola)
    if(checkText(testo))
    {
        switch (m[1])
        {
            case "VF":
                
                question = {
                  type: m[1],
                  text: m[2],
                  ans: checkVF()
                }; 
                break;

            case "MU":
                var answer = getRightAns();
                if(answer.length == 1) 
                {
                    question = {
                        type: m[1],
                        text: m[2],
                        ans: checkM(),
                        rightAns: getRightAnsObj('MU') //answer
                    }; 
                }               
                break;

            case "MX":
                question = {
                    type: m[1],
                    text: m[2],
                    ans: checkM(),
                    rightAns: getRightAnsObj('MX')
                }; 
                break;

            case "AS":
                question = {
                  type: m[1],
                  text: m[2],
                  ans: checkAS(),
				  rightAns: getRightAnsObj('AS') //restituisce oggetto: {idA:"idB", idA:"idB"}
                }; 
                break;
                
			case "OD":
                question = {
                    type: m[1],
                    text: m[2],
                    ans: checkM(),
                    rightAns: getRightAnsObj('OD')  //restituisce oggetto: {1:"id1", 2:"id2"}
                }; 
                break;	
           
        }
    }
    // la variabile question sarà un elemento con dei campi dipendenti dal tipo di domanda,
    // nello switch precedente si capisce che tipo di elemento viene ritornato
    if(question)
        return question;
    else
        return null;    
}

function checkVF()
{
    switch(m[3])
    {
        case ("V"):
        case ("v"):
            return true;
            
        case ("F"):
        case ("f"):
            return false;
        default:
			return "errore in checkVF";
    }
}


function checkAS()
{
    var AA = [],
        BB = [];
    
    var re = /([abAB])->([a-zA-Z0-9])[\s]*(\S{1,}.*)/;
    var s;

    var lines = m[3].split('\n');
    var j = 0; 
    for (var i = 0; i < lines.length; i++) {
        if(lines[i] == null)
            j = i; 
    }
    lines.pop(j); 

    for (var i = 0; i < lines.length; i++)
    {
        if ((s = re.exec(lines[i])) !== null)
            if (s.index === re.lastIndex) 
                re.lastIndex++;
        
       
		//ans: {A:[{text:"banana",id:3,risp:""},{text:"fragola",id:5,risp:""}],B:[{text:"giallo",id:3},{text:"viola",id:1},{text:"rosso",id:5}]}
        var element = { text:s[3], id:s[2] };

        switch(s[1])
        {
            case ('A'):
                AA.push(element);
                break;
            case ('B'):
                BB.push(element);
                break;
        }
		
    }
	var groups = {};
	if(AA.length < BB.length){ groups.A = AA; groups.B = BB; }
	else { groups.A = BB; groups.B = AA; }
    return groups;
}


function checkM()
{
    var re ;
	if(m[1] == "OD") //Per domande di tipo Ordinamento 'OD'
	{ re = /{(\d[\s]*)\}[\s]*(\S{1,}.*)[\s]*/; }
	else    		// Per domande di tipo multipla con unica risposta 'MU' 
	{ re = /{(X?[\s]*)\}[\s]*(\S{1,}.*)[\s]*/; }
	
	var s;

    var lines = m[3].split('\n');
    
    var j = 0; 
    for (var i = 0; i < lines.length; i++) {
        if(lines[i] == null)
            j = i; 
    }
    lines.pop(j); 

    for (var i = 0; i < lines.length; i++)
    {
        if ((s = re.exec(lines[i])) !== null)
		{
            if (s.index === re.lastIndex) 
			{ re.lastIndex++; }
			if(m[1] == "OD")
			{
				lines[i] = {text: s[2], id: s[1] };
			}
			else
			{
				lines[i] = {text: s[2], id: i };
			}
		}
		

    }
    return lines;

}

function checkMX()
{
    var re = /{(X?[\s]*)\}[\s]*(\S{1,}.*)[\s]*/;
    var s;

    var lines = m[3].split('\n');
    
    var j = 0; 
    for (var i = 0; i < lines.length; i++) {
        if(lines[i] == null)
            j = i; 
    }
    lines.pop(j); 

    for (var i = 0; i < lines.length; i++)
    {
        if ((s = re.exec(lines[i])) !== null)
        {
            if (s.index === re.lastIndex) 
			{ re.lastIndex++; }
		
			lines[i] = {text: s[2], id: i };
			
		}
    }
    return lines;
}

function getRightAns()
{   

    var re = /\{X[\s]*\}([\s]*\S{1,}.*[\s]*)/;
    var s; 

    var lines = m[3].split('\n');

    var j = 0; 
    for (var i = 0; i < lines.length; i++) {
        if(lines[i] == null)
            j = i; 
    }
    lines.pop(j); 

    var rAns = [];
    for (var i = 0; i < lines.length; i++)
    {
        if ((s = re.exec(lines[i])) !== null)
        {
            if (s.index === re.lastIndex) 
                re.lastIndex++;
            rAns.push(s[1]);
        }
            
    }

    return rAns;
}

function getRightAnsObj(ztipo)
{   
    var re ;
	if(ztipo == "OD")
	{  re = /{(\d[\s]*)\}[\s]*(\S{1,}.*)[\s]*/; }
	else if(ztipo == "AS")
	{ re = /([abAB])->([a-zA-Z0-9])[\s]*(\S{1,}.*)[\s]*/;	}
	else
	{  re = /{(X?[\s]*)\}[\s]*(\S{1,}.*)[\s]*/; }

   // var re = /{(X?[\s]*)\}[\s]*(\S{1,}.*)[\s]*/;
    var s; 

    var lines = m[3].split('\n');
    var j = 0; 
    for (var i = 0; i < lines.length; i++) {
        if(lines[i] == null)
            j = i; 
    }
    lines.pop(j); 
	
    var rAns={} ;// = [];
	var rBns={};
    for (var i = 0; i < lines.length; i++)
    {
        if ((s = re.exec(lines[i])) !== null)
        {
            if (s.index === re.lastIndex) 
                re.lastIndex++;
           // rAns.push(s[1]);
			
			if(ztipo == "OD")
			{	
				rAns[s[1]] = s[1];
			}
			else if(ztipo == "AS")
			{	if(s[1] == 'A'){ rAns[s[2]] = s[2]; }
				else { rBns[s[2]] = s[2]; }
				
			}
			else if(s[1] == 'X') 
			{ 	if(ztipo === 'MU') { return i;} //se siamo su una domanda di tipo MU si esce solo con l'indice la risposta giusta.
				rAns[i] = true; 	
			}else rAns[i] = false;  
        }
            
    }
	if(ztipo == "AS" )
	{	if( Object.keys(rBns).length < Object.keys(rAns).length){ return rBns; } } // L'insieme con più elementi contiene il disturbatore
    return rAns;
}
