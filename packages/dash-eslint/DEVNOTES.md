# DEVNOTES:

- [BUG] 'airbnb-typescript'
- - Error: Error while loading rule '@typescript-eslint/dot-notation': You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.

# OLD SETTINGS FOR REFERENCE

module.exports {

"extends":[
"turbo",
"plugin:react/recommended",
"plugin:react/jsx-runtime",
"prettier",
"./jsdoc.js",
"./typescript.cjs"
],
"rules":{
"react/jsx-key":"off",
"@next/next/no-html-link-for-pages":"off" // this settings produce also the '@typescript-eslint/dot-notation' Error.
},
"parser":"@typescript-eslint/parser",
"parserOptions":{
"ecmaVersion":2020,
"sourceType":"module",
"ecmaFeatures":{
"jsx":true
}
},
"settings":{
"react":{
"version":"detect"
}
}
}

"overrides":[
{
"files":[
"_.tsx"
],
"rules":{
"jsdoc/require-jsdoc":"off",
"jsdoc/require-param":"off",
"@typescript-eslint/naming-convention":[
"off",
{
"selector":[
"enumMember",
"interface"
],
"format":[
"PascalCase"
]
},
{
"selector":[
"variable",
"function",
"classMethod"
],
"leadingUnderscore":"allow",
"trailingUnderscore":"allow",
"format":[
"camelCase"
]
}
]
}
}
],
"rules":{
"@next/next/no-img-element":"off",
"no-unused-vars":[
"error",
{
"argsIgnorePattern":"^_"
}
],
"eqeqeq":[
"error",
"always"
]
}
