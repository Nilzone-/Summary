var stopwords   = require('stopwords').english;
var natural     = require('natural');
    
function Summary(text) {
    
	if (typeof text !== 'string') throw new Error("Argument must be a string");
	
    this.text = text;
	this.sentences = [];
    this.sentencesScore = {};
	this.wordCount = {};
}

function isStopWord(word) {
    return stopwords.indexOf(word.toLowerCase()) < 0 && word.length > 1;
}

function setBaseWord(word) {
    return natural.PorterStemmer.stem(word); 
}

function modify(sentence) {
    
    return sentence.replace(/[:.,?!\'\/\"]+/g, ' ')
                   .split(/\s+/)
                   .filter(isStopWord)
                   .map(setBaseWord)
}


function init(text) {
    return new Summary(text);
}


Summary.prototype.wordFrequency = function () {
    
	return modify(this.text).reduce(function(map, word) {

        map[word] = (map[word] || 0) + 1;
        return map;

     }, this.wordCount);
}


Summary.prototype.splitTextIntoSentences = function () {
	this.sentences = this.text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|")
	
    return this.sentences;
}


Summary.prototype.rankSentences = function() {
    
    for(var i = 0; i < this.sentences.length; i++) {
        var sentence = this.sentences[i];
        var count = 0;
        
        sentence = sentence.replace(/[\w\s,']*"[\w\s.,'"]+./g, '');
        
        
        modify(sentence).forEach(word => {
            console.log(word);
            count += Math.pow(this.wordCount[word], 2) || 0;
        });
    
        this.sentencesScore[sentence] = count; 
    }
}

Summary.prototype.makeSummary = function() {
    
    this.wordFrequency();
    this.splitTextIntoSentences();
    this.rankSentences();
    
    var sortable = [];
    
    for (var sentence in this.sentencesScore) {
        sortable.push([sentence, this.sentencesScore[sentence]])
    }
    var result = sortable.sort(function(a, b) {return b[1] - a[1]});
                         //.reduce((a, b) => {return a.concat(b[0]);}, []);
    
    return result;
}




module.exports = init;
