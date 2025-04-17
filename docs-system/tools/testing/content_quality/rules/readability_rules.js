/**
 * Readability Rules for Content Quality Validation
 * 
 * This module provides rules for assessing content readability, including
 * checks for sentence length, paragraph size, readability scores, and clarity.
 */

/**
 * Calculates Flesch-Kincaid readability scores for text
 * @param {string} text - The text to analyze
 * @returns {Object} Readability scores and statistics
 */
function calculateReadabilityScores(text) {
  // Clean up text for analysis
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Count sentences (very basic - split on .!?)
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1; // Avoid division by zero
  
  // Count words
  const words = cleanText.split(/\s+/).filter(w => w.match(/[a-zA-Z0-9]/));
  const wordCount = words.length || 1; // Avoid division by zero
  
  // Count syllables (simplified approximation)
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllables(word);
  }
  
  // Calculate average sentence length
  const avgSentenceLength = wordCount / sentenceCount;
  
  // Calculate Flesch Reading Ease score
  // 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  const fleschReadingEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * (syllableCount / wordCount));
  
  // Calculate Flesch-Kincaid Grade Level
  // 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
  const fleschKincaidGradeLevel = (0.39 * avgSentenceLength) + (11.8 * (syllableCount / wordCount)) - 15.59;
  
  return {
    sentenceCount,
    wordCount,
    syllableCount,
    avgSentenceLength,
    fleschReadingEase,
    fleschKincaidGradeLevel
  };
}

/**
 * Count syllables in a word (simplified approximation)
 * @param {string} word - The word to count syllables in
 * @returns {number} Syllable count
 */
function countSyllables(word) {
  const lowerWord = word.toLowerCase();
  
  // Handle special cases
  if (lowerWord.length <= 3) {
    return 1;
  }
  
  // Remove common ending "e" which is often silent
  const wordWithoutSilentE = lowerWord.replace(/e$/, '');
  
  // Count vowel groups as syllables
  const vowelGroups = wordWithoutSilentE.match(/[aeiouy]+/g);
  const count = vowelGroups ? vowelGroups.length : 0;
  
  // Ensure at least one syllable
  return Math.max(1, count);
}

/**
 * Readability rules for content quality validation
 */
const readabilityRules = {
  // Check for long sentences
  longSentences: {
    name: 'Sentence Length Check',
    category: 'readability',
    description: 'Identifies sentences that are too long, which can reduce readability.',
    validate: (content) => {
      const issues = [];
      const threshold = 30; // Maximum recommended words per sentence
      
      // Check sections
      content.sections.forEach(section => {
        const text = section.content;
        const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
        
        sentences.forEach(sentence => {
          const wordCount = sentence.split(/\s+/).filter(w => w.match(/\w/)).length;
          
          if (wordCount > threshold) {
            const position = text.indexOf(sentence);
            
            issues.push({
              type: 'long_sentence',
              message: `Sentence is too long (${wordCount} words). Consider breaking it into smaller sentences.`,
              context: sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''),
              location: {
                section: section.title,
                position: section.position.start + position
              },
              severity: wordCount > 40 ? 'warning' : 'suggestion',
              wordCount
            });
          }
        });
      });
      
      return issues;
    }
  },
  
  // Check for long paragraphs
  longParagraphs: {
    name: 'Paragraph Length Check',
    category: 'readability',
    description: 'Identifies paragraphs that are too long, which can make content difficult to follow.',
    validate: (content) => {
      const issues = [];
      const threshold = 150; // Maximum recommended words per paragraph
      
      // Check sections
      content.sections.forEach(section => {
        const text = section.content;
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        paragraphs.forEach(paragraph => {
          const wordCount = paragraph.split(/\s+/).filter(w => w.match(/\w/)).length;
          
          if (wordCount > threshold) {
            const position = text.indexOf(paragraph);
            
            issues.push({
              type: 'long_paragraph',
              message: `Paragraph is too long (${wordCount} words). Consider breaking it into smaller paragraphs.`,
              context: paragraph.substring(0, 100) + (paragraph.length > 100 ? '...' : ''),
              location: {
                section: section.title,
                position: section.position.start + position
              },
              severity: wordCount > 200 ? 'warning' : 'suggestion',
              wordCount
            });
          }
        });
      });
      
      return issues;
    }
  },
  
  // Check overall readability score
  readabilityScore: {
    name: 'Readability Score Assessment',
    category: 'readability',
    description: 'Analyzes document readability using Flesch-Kincaid scores.',
    validate: (content) => {
      const issues = [];
      
      // Target values for technical documentation
      const targetFleschScore = 40; // Lower target for technical content
      
      // Analyze entire content
      const scores = calculateReadabilityScores(content.raw);
      
      // Add issue if readability score is too low
      if (scores.fleschReadingEase < targetFleschScore) {
        issues.push({
          type: 'low_readability',
          message: `Overall readability score is low (${scores.fleschReadingEase.toFixed(1)}). The content may be difficult to understand.`,
          severity: scores.fleschReadingEase < 30 ? 'warning' : 'suggestion',
          scores,
          recommendations: [
            'Use shorter sentences where possible',
            'Break up long paragraphs',
            'Use simpler vocabulary when technical terms aren\'t required',
            'Add more headings to break up content'
          ]
        });
      }
      
      // High grade level (too complex)
      if (scores.fleschKincaidGradeLevel > 12) {
        issues.push({
          type: 'high_grade_level',
          message: `Content requires a high reading level (grade ${scores.fleschKincaidGradeLevel.toFixed(1)}). Consider simplifying.`,
          severity: scores.fleschKincaidGradeLevel > 16 ? 'warning' : 'suggestion',
          scores
        });
      }
      
      return issues;
    }
  },
  
  // Check for passive voice overuse
  passiveVoice: {
    name: 'Passive Voice Check',
    category: 'readability',
    description: 'Identifies overuse of passive voice, which can make content less direct and engaging.',
    validate: (content) => {
      const issues = [];
      
      // Passive voice patterns (simplified detection)
      const passivePatterns = [
        /\b(?:is|are|was|were|be|been|being)\s+(\w+ed)\b/gi,
        /\b(?:is|are|was|were|be|been|being)\s+(\w+en)\b/gi,
        /\b(?:is|are|was|were|be|been|being)\s+(\w+)(?:ed|d)\s+by\b/gi
      ];
      
      // Check sections
      content.sections.forEach(section => {
        const text = section.content;
        const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
        let passiveCount = 0;
        
        sentences.forEach(sentence => {
          // Check for passive voice patterns
          let isPassive = false;
          
          for (const pattern of passivePatterns) {
            if (pattern.test(sentence)) {
              isPassive = true;
              passiveCount++;
              break;
            }
          }
          
          if (isPassive) {
            const position = text.indexOf(sentence);
            
            issues.push({
              type: 'passive_voice',
              message: 'Sentence uses passive voice. Consider using active voice for more clarity and directness.',
              context: sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''),
              location: {
                section: section.title,
                position: section.position.start + position
              },
              severity: 'suggestion'
            });
          }
        });
        
        // Check for overall passive voice percentage
        if (sentences.length > 5 && passiveCount / sentences.length > 0.3) {
          issues.push({
            type: 'excessive_passive_voice',
            message: `Section "${section.title}" uses passive voice excessively (${Math.round(passiveCount / sentences.length * 100)}% of sentences).`,
            location: {
              section: section.title
            },
            severity: 'warning',
            passivePercentage: passiveCount / sentences.length
          });
        }
      });
      
      return issues;
    }
  },
  
  // Check for complex words usage
  complexWords: {
    name: 'Complex Words Check',
    category: 'readability',
    description: 'Identifies unnecessarily complex words that could be replaced with simpler alternatives.',
    validate: (content) => {
      const issues = [];
      
      // Complex word patterns with alternatives
      const complexWordPatterns = {
        'utilize': 'use',
        'implement': 'use, add, or set up',
        'functionality': 'feature',
        'commence': 'start or begin',
        'terminate': 'end or stop',
        'endeavor': 'try',
        'facilitate': 'help or enable',
        'subsequently': 'later or after',
        'methodology': 'method',
        'aforementioned': 'this or these',
        'leverage': 'use',
        'constitute': 'form or make up',
        'requisite': 'required or needed',
        'sufficient': 'enough',
        'approximately': 'about',
        'initiate': 'start',
        'component': 'part',
        'demonstrate': 'show',
        'assist': 'help',
        'visualize': 'see or picture',
        'attempt': 'try',
        'transmit': 'send',
        'procure': 'get or obtain'
      };
      
      // Check content for complex words
      const text = content.raw;
      
      for (const [complexWord, alternative] of Object.entries(complexWordPatterns)) {
        const regex = new RegExp(`\\b${complexWord}\\b`, 'gi');
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          const position = match.index;
          const context = text.substring(
            Math.max(0, position - 30),
            Math.min(text.length, position + complexWord.length + 30)
          );
          
          issues.push({
            type: 'complex_word',
            message: `Consider replacing "${complexWord}" with simpler alternative(s): ${alternative}.`,
            context,
            position,
            complexWord,
            alternative,
            severity: 'suggestion'
          });
        }
      }
      
      return issues;
    }
  }
};

module.exports = readabilityRules;