var stopwords   = require('stopwords').english;
var natural     = require('natural');
var texts       = require('./texts.js');

function Summary(text) {
    
	if (typeof text  !== 'string') throw new Error("Argument must be a string");
	
    this.text = text
	this.sentences = [];
    this.sentencesScore = {};
	this.wordPoints = {};
}

Summary.prototype.wordFrequency = function () {
    
    
	return this.text.replace(/[:.,?!\'\/\"]+/g, ' ')
                    .split(/\s+/)
                    .filter(word => { return stopwords.indexOf(word.toLowerCase()) < 0 && word.length > 3; })
                    .map(word => { return natural.PorterStemmer.stem(word); })
                    .reduce(function(map, word) {
                    
                        map[word] = (map[word] || 0) + 1;
                        return map;

                     }, this.wordPoints)
}


Summary.prototype.splitTextIntoSentences = function () {
	this.sentences = this.text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|")
	
    return this.sentences;
}

Summary.prototype.rankSentences = function () {
	for(var i = 0, count = 0; i < this.sentences.length; i++) {
        var sentence = this.sentences[i];
        
        sentence = sentence.replace(/[\w\s,']*"[\w\s.,'"]+./g, '');
        
        sentence.replace(/[:.,?!\'\/\"]+/g, ' ')
                .split(/\s+/)
                .filter(word => { return stopwords.indexOf(word.toLowerCase()) < 0 && word.length > 3; })
                .map(word => { return natural.PorterStemmer.stem(word); })
                .forEach(word => {
                    var wordPoint = this.wordPoints[word] || 0;
                    var point = (wordPoint <= 1) ? 0 : wordPoint;
                    count += point || 0;
                 });
    
        this.sentencesScore[sentence] = count; 
        count = 0;
    }
    
}

Summary.prototype.printMostValuable = function() {
    var sortable = [];
    
    for (var sentence in this.sentencesScore) {
        sortable.push([sentence, this.sentencesScore[sentence]])
    }
    sortable.sort(function(a, b) {return b[1] - a[1]});
    
    console.log(sortable);
}




var text = texts[0];

var s = new Summary(text);

s.wordFrequency();
s.splitTextIntoSentences();
s.rankSentences();  

s.printMostValuable();
