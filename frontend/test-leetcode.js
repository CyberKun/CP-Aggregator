const fs = require('fs');

async function testLeetcode() {
  let skip = 0;
  let limit = 500;
  let total = 0;

  try {
    const q = { 
      query: `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) { 
        problemsetQuestionList: questionList(categorySlug: $categorySlug limit: $limit skip: $skip filters: $filters) { 
          total: totalNum 
          questions: data { difficulty title titleSlug topicTags { name } } 
        } 
      }`, 
      variables: {categorySlug: '', skip: skip, limit: limit, filters: {}}
    };

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(q)
    });
    
    const d = await res.json();
    console.log(d.data.problemsetQuestionList.questions.length);
  } catch(e) {
    console.log(e);
  }
}
testLeetcode();
