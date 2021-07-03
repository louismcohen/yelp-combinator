function arrowTemplate(
  { template },
  opts,
  { imports, interfaces, componentName, props, jsx, exports },
) {
  const plugins = ['jsx']
  if (opts.typescript) {
    plugins.push('typescript')
  }

  const defaultViewBox = '0 0 512 512';
  if (!jsx.openingElement.attributes.find(x => x.name.name === 'viewBox')) {
    jsx.openingElement.attributes.push({
      name: {
        name: 'viewBox',
        type: 'JSXIdentifier'
      },
      type: 'JSXAttribute',
      value: {
        value: defaultViewBox,
        type: 'StringLiteral'
      }
    })
  }
  
  const typeScriptTpl = template.smart({ plugins })
  return typeScriptTpl.ast`
    ${imports}
    ${interfaces}

    const ${componentName} = (${props}) => {
      return ${jsx};
    }

    ${exports}
      `
}
module.exports = arrowTemplate