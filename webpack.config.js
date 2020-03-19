const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
};

// const path = require('path');
// module.exports = {
//   entry: ["@babel/polyfill", './src/index.js'],
//   mode: 'production',
//   output: {
//     path: path.resolve(__dirname, 'build'),
//     filename: 'index.js',
//     libraryTarget: 'commonjs2'
//   },
//   module: {
//     rules: [
//       {
//         test: /\.css$/,
//         use: ['style-loader', 'css-loader']
//       },
//       {
//         test: /\.js$/,
//         include: path.resolve(__dirname, 'src'),
//         exclude: /(node_modules|bower_components|build)/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-env'],
//             plugins: ['transform-class-properties']
//           }
//         }
//       }
//     ]
//   },
//   externals: {
//     'react': 'commonjs react'
//   }
// };
