/**
 * Consistency Rules for Content Quality Validation
 * 
 * This module provides rules for assessing content consistency, including
 * checks for terminology, formatting, style, and structure.
 */

/**
 * Consistency rules for content quality validation
 */
const consistencyRules = {
  // Check for terminology consistency
  terminologyConsistency: {
    name: 'Terminology Consistency Check',
    category: 'consistency',
    description: 'Verifies that terminology is used consistently throughout the document.',
    validate: (content, options = {}) => {
      const issues = [];
      const { glossary = {} } = options;
      
      // If no glossary terms, skip this check
      if (Object.keys(glossary).length === 0) {
        return [];
      }
      
      // Look for variations of glossary terms
      const text = content.raw;
      
      for (const [term, definition] of Object.entries(glossary)) {
        // Skip short terms (to avoid false positives)
        if (term.length < 3) {
          continue;
        }
        
        // Define common variations (case, pluralization, hyphenation)
        const variations = [
          // Original term
          term,
          // Capitalized variants
          term.toLowerCase(),
          term.toUpperCase(),
          term.charAt(0).toUpperCase() + term.slice(1),
          // Plural variants (simplistic)
          term + 's',
          term + 'es',
          // Hyphenated / space variants
          term.replace(/\s+/g, '-'),
          term.replace(/\s+/g, '')
        ];
        
        // Check for each variation
        const foundVariations = new Set();
        
        for (const variation of variations) {
          // Skip if it's the canonical term
          if (variation === term) {
            continue;
          }
          
          const regex = new RegExp(`\\b${variation}\\b`, 'gi');
          if (regex.test(text)) {
            foundVariations.add(variation);
          }
        }
        
        // If multiple variations are used, report the issue
        if (foundVariations.size > 0) {
          issues.push({
            type: 'inconsistent_terminology',
            message: `Term "${term}" appears in multiple forms: ${Array.from(foundVariations).join(', ')}. Consider using "${term}" consistently.`,
            term,
            variations: Array.from(foundVariations),
            severity: 'warning'
          });
        }
      }
      
      return issues;
    }
  },
  
  // Check for heading case consistency
  headingCaseConsistency: {
    name: 'Heading Case Consistency Check',
    category: 'consistency',
    description: 'Checks that heading capitalization is consistent throughout the document.',
    validate: (content) => {
      const issues = [];
      
      // Get all headings (level 1-3)
      const headings = content.sections
        .filter(section => section.level >= 1 && section.level <= 3)
        .map(section => section.title);
      
      if (headings.length < 2) {
        return []; // Need at least 2 headings to check consistency
      }
      
      // Determine heading case styles
      let titleCaseCount = 0;
      let sentenceCaseCount = 0;
      let allCapsCount = 0;
      
      for (const heading of headings) {
        if (heading === heading.toUpperCase()) {
          allCapsCount++;
        } else if (isTitleCase(heading)) {
          titleCaseCount++;
        } else if (isSentenceCase(heading)) {
          sentenceCaseCount++;
        }
      }
      
      // Determine dominant style
      const total = headings.length;
      let dominantStyle = '';
      let inconsistentHeadings = [];
      
      if (titleCaseCount > sentenceCaseCount && titleCaseCount > allCapsCount) {
        dominantStyle = 'title case';
        inconsistentHeadings = headings.filter(h => !isTitleCase(h));
      } else if (sentenceCaseCount > titleCaseCount && sentenceCaseCount > allCapsCount) {
        dominantStyle = 'sentence case';
        inconsistentHeadings = headings.filter(h => !isSentenceCase(h));
      } else if (allCapsCount > titleCaseCount && allCapsCount > sentenceCaseCount) {
        dominantStyle = 'all caps';
        inconsistentHeadings = headings.filter(h => h !== h.toUpperCase());
      }
      
      // Report if inconsistent
      if (dominantStyle && inconsistentHeadings.length > 0) {
        issues.push({
          type: 'inconsistent_heading_case',
          message: `Heading capitalization is inconsistent. Dominant style is ${dominantStyle} (${Math.round((total - inconsistentHeadings.length) / total * 100)}% of headings), but some headings use different styles.`,
          dominantStyle,
          inconsistentHeadings,
          severity: 'warning'
        });
      }
      
      return issues;
    }
  },
  
  // Check for list style consistency
  listStyleConsistency: {
    name: 'List Style Consistency Check',
    category: 'consistency',
    description: 'Verifies that list formatting is consistent throughout the document.',
    validate: (content) => {
      const issues = [];
      
      const text = content.raw;
      
      // Count different list styles
      const bulletStyles = {
        dash: (text.match(/^-\s+/gm) || []).length,
        asterisk: (text.match(/^\*\s+/gm) || []).length,
        plus: (text.match(/^\+\s+/gm) || []).length
      };
      
      const numberedStyles = {
        period: (text.match(/^\d+\.\s+/gm) || []).length,
        parenthesis: (text.match(/^\d+\)\s+/gm) || []).length
      };
      
      // Check for bullet list inconsistency
      const bulletTotal = bulletStyles.dash + bulletStyles.asterisk + bulletStyles.plus;
      
      if (bulletTotal > 0) {
        let mixedBulletStyles = false;
        let dominantBullet = '';
        let maxBulletCount = 0;
        
        for (const [style, count] of Object.entries(bulletStyles)) {
          if (count > 0 && count < bulletTotal) {
            mixedBulletStyles = true;
          }
          
          if (count > maxBulletCount) {
            maxBulletCount = count;
            dominantBullet = style;
          }
        }
        
        if (mixedBulletStyles) {
          const summary = Object.entries(bulletStyles)
            .filter(([, count]) => count > 0)
            .map(([style, count]) => `${style} (${count})`)
            .join(', ');
          
          issues.push({
            type: 'inconsistent_bullet_lists',
            message: `Document uses multiple bullet list styles: ${summary}. Consider standardizing on ${dominantBullet} for all bullet lists.`,
            dominantStyle: dominantBullet,
            listStyles: bulletStyles,
            severity: 'warning'
          });
        }
      }
      
      // Check for numbered list inconsistency
      const numberedTotal = numberedStyles.period + numberedStyles.parenthesis;
      
      if (numberedTotal > 0) {
        let mixedNumberedStyles = false;
        let dominantNumbered = '';
        let maxNumberedCount = 0;
        
        for (const [style, count] of Object.entries(numberedStyles)) {
          if (count > 0 && count < numberedTotal) {
            mixedNumberedStyles = true;
          }
          
          if (count > maxNumberedCount) {
            maxNumberedCount = count;
            dominantNumbered = style;
          }
        }
        
        if (mixedNumberedStyles) {
          const summary = Object.entries(numberedStyles)
            .filter(([, count]) => count > 0)
            .map(([style, count]) => `${style} (${count})`)
            .join(', ');
          
          issues.push({
            type: 'inconsistent_numbered_lists',
            message: `Document uses multiple numbered list styles: ${summary}. Consider standardizing on ${dominantNumbered} for all numbered lists.`,
            dominantStyle: dominantNumbered,
            listStyles: numberedStyles,
            severity: 'warning'
          });
        }
      }
      
      return issues;
    }
  },
  
  // Check for link style consistency
  linkStyleConsistency: {
    name: 'Link Style Consistency Check',
    category: 'consistency',
    description: 'Checks if links are formatted consistently throughout the document.',
    validate: (content) => {
      const issues = [];
      
      const text = content.raw;
      
      // Count different link styles
      const linkStyles = {
        markdown: (text.match(/\[.+?\]\(.+?\)/g) || []).length,
        htmlFull: (text.match(/<a\s+(?:[^>]*?\s+)?href=["'][^"']*["'][^>]*>.*?<\/a>/g) || []).length,
        autoLink: (text.match(/<https?:\/\/[^>]+>/g) || []).length,
        bareURL: (text.match(/(?<![(<])(https?:\/\/\S+)(?![)>])/g) || []).length
      };
      
      const totalLinks = Object.values(linkStyles).reduce((sum, count) => sum + count, 0);
      
      if (totalLinks > 1) {
        let mixedLinkStyles = false;
        let dominantStyle = '';
        let maxCount = 0;
        
        for (const [style, count] of Object.entries(linkStyles)) {
          if (count > 0 && count < totalLinks) {
            mixedLinkStyles = true;
          }
          
          if (count > maxCount) {
            maxCount = count;
            dominantStyle = style;
          }
        }
        
        if (mixedLinkStyles) {
          const summary = Object.entries(linkStyles)
            .filter(([, count]) => count > 0)
            .map(([style, count]) => `${style} (${count})`)
            .join(', ');
          
          issues.push({
            type: 'inconsistent_link_styles',
            message: `Document uses multiple link styles: ${summary}. Consider standardizing on ${dominantStyle} for all links.`,
            dominantStyle,
            linkStyles,
            severity: 'warning'
          });
        }
      }
      
      return issues;
    }
  },
  
  // Check for consistent code block formatting
  codeStyleConsistency: {
    name: 'Code Block Style Consistency Check',
    category: 'consistency',
    description: 'Verifies that code blocks are formatted consistently throughout the document.',
    validate: (content) => {
      const issues = [];
      
      const text = content.raw;
      
      // Count different code block styles
      const codeStyles = {
        backtickFenced: (text.match(/```[\w-]*\n[\s\S]*?\n```/g) || []).length,
        tildeFenced: (text.match(/~~~[\w-]*\n[\s\S]*?\n~~~/g) || []).length,
        indented: (text.match(/(?:(?:^[ ]{4}|\t).*?$\n?)+/gm) || []).length,
        htmlCodeBlock: (text.match(/<pre><code>[\s\S]*?<\/code><\/pre>/g) || []).length
      };
      
      const totalCodeBlocks = Object.values(codeStyles).reduce((sum, count) => sum + count, 0);
      
      if (totalCodeBlocks > 1) {
        let mixedCodeStyles = false;
        let dominantStyle = '';
        let maxCount = 0;
        
        for (const [style, count] of Object.entries(codeStyles)) {
          if (count > 0 && count < totalCodeBlocks) {
            mixedCodeStyles = true;
          }
          
          if (count > maxCount) {
            maxCount = count;
            dominantStyle = style;
          }
        }
        
        if (mixedCodeStyles) {
          const summary = Object.entries(codeStyles)
            .filter(([, count]) => count > 0)
            .map(([style, count]) => `${style} (${count})`)
            .join(', ');
          
          issues.push({
            type: 'inconsistent_code_styles',
            message: `Document uses multiple code block styles: ${summary}. Consider standardizing on ${dominantStyle} for all code blocks.`,
            dominantStyle,
            codeStyles,
            severity: 'warning'
          });
        }
      }
      
      // Check for inconsistent language specifications in code blocks
      const languageSpecifiers = [];
      const codeBlockRegex = /```([\w-]*)\n[\s\S]*?\n```/g;
      let match;
      
      while ((match = codeBlockRegex.exec(text)) !== null) {
        languageSpecifiers.push(match[1]);
      }
      
      // Check if some blocks specify language and others don't
      const withLanguage = languageSpecifiers.filter(lang => lang.trim() !== '').length;
      const withoutLanguage = languageSpecifiers.length - withLanguage;
      
      if (withLanguage > 0 && withoutLanguage > 0) {
        issues.push({
          type: 'inconsistent_language_specification',
          message: `Some code blocks specify a language (${withLanguage}) while others don't (${withoutLanguage}). Consider adding language specifiers to all code blocks.`,
          withLanguage,
          withoutLanguage,
          severity: 'suggestion'
        });
      }
      
      return issues;
    }
  }
};

/**
 * Checks if a string is in title case (most words capitalized)
 * @param {string} text - The text to check
 * @returns {boolean} Whether the text is in title case
 */
function isTitleCase(text) {
  const words = text.split(/\s+/);
  if (words.length < 2) return false;
  
  // Count capitalized words (excluding common small words)
  const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'as', 'at', 
                      'by', 'for', 'from', 'in', 'into', 'near', 'of', 'on', 'onto', 
                      'to', 'with'];
  
  let capitalizedCount = 0;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.length === 0) continue;
    
    // First and last words should always be capitalized in title case
    if (i === 0 || i === words.length - 1) {
      if (word[0] === word[0].toUpperCase()) {
        capitalizedCount++;
      }
    } 
    // Skip checking small words
    else if (!smallWords.includes(word.toLowerCase())) {
      if (word[0] === word[0].toUpperCase()) {
        capitalizedCount++;
      }
    }
  }
  
  // Determine if most eligible words are capitalized
  const eligibleWords = words.length - smallWords.filter(w => words.includes(w)).length;
  return capitalizedCount / eligibleWords >= 0.7; // At least 70% capitalized
}

/**
 * Checks if a string is in sentence case (only first word capitalized)
 * @param {string} text - The text to check
 * @returns {boolean} Whether the text is in sentence case
 */
function isSentenceCase(text) {
  const words = text.split(/\s+/);
  if (words.length < 2) return false;
  
  // First word should be capitalized
  if (words[0].length > 0 && words[0][0] !== words[0][0].toUpperCase()) {
    return false;
  }
  
  // Count non-capitalized words (excluding proper nouns and first word)
  let nonCapitalizedCount = 0;
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (word.length === 0) continue;
    
    // Skip words that look like proper nouns or acronyms
    if (isProperNounOrAcronym(word)) {
      continue;
    }
    
    if (word[0] === word[0].toLowerCase()) {
      nonCapitalizedCount++;
    }
  }
  
  // Determine if most non-proper words after the first are lowercase
  return nonCapitalizedCount / (words.length - 1) >= 0.7; // At least 70% lowercase
}

/**
 * Rough check if a word is likely a proper noun or acronym
 * @param {string} word - The word to check
 * @returns {boolean} Whether the word is likely a proper noun or acronym
 */
function isProperNounOrAcronym(word) {
  // Common acronyms in tech docs
  const commonAcronyms = ['API', 'HTTP', 'REST', 'JSON', 'XML', 'URL', 'UI', 'UX', 
                          'HTML', 'CSS', 'JS', 'SDK', 'CLI', 'CPU', 'GPU', 'RAM', 'I/O'];
  
  if (commonAcronyms.includes(word.toUpperCase())) {
    return true;
  }
  
  // All caps likely acronym
  if (word === word.toUpperCase() && word.length > 1) {
    return true;
  }
  
  // Likely proper noun if capitalized and not at start of sentence
  return word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase();
}

module.exports = consistencyRules;