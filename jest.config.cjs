module.exports = {




  testMatch: [
    "**/tests/**/*.test.js",
    "**/tests/**/*.spec.js"
  ],
  
  // Ignore certain directories
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],

   // Code coverage configuration
   collectCoverage: true,
   coverageDirectory: "./coverage",
   coverageReporters: [
     "text",
     "lcov"
   ],


  //   transform: {
  //     '^.+\\.js$': 'babel-jest', // Transforms JS files using Babel
  //   },
  // };
  
    // Transformation for JS, JSX, TS, TSX files
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  }
};
