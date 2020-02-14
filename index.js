const posthtml = require('posthtml')

const plugin = () => tree => {
  tree.match({ tag: 'svg' }, node => {
    node.attrs = node.attrs || {}
    // Bind all events so that you can @click="handler" instead of @click.native="handler"
    node.attrs['v-on'] = '$listeners'
    return node
  })
  // SVGO will inline styles, so if you don't turn off relevant plugin
  // the tree will never match `style` nodes because they don't exist
  tree.match({ tag: 'style' }, node => {
    // Ignore the style tag if it's empty
    if (!node.content || node.content.length === 0) return

    // When SVGO is turned off
    // Make `style` tags work by using a dynamic component
    node.tag = 'component'
    node.attrs = node.attrs || {}
    node.attrs.is = 'style'
    return node
  })
}

const createComponent = (svg,name,attachFile) => {
  var result=`<template>\n${svg}\n</template>`
  if(attachFile && attachFile.ts){
		result+=`<script lang ="ts" src="./${name}.ts"></script>`
	}
	if (attachFile && attachFile.scss){
			result+=`<style scoped src="./${name}.scss"></script>`
	}
  return result;
}

module.exports = (input,name,attachFile, { sync } = {}) => {
  const stream = posthtml([plugin()]).process(input, {
    sync,
    recognizeSelfClosing: true
  })

  if (stream.then) {
    return stream.then(res => ({
      component: createComponent(res.html,name,attachFile)
    }))
  }

  return { component: createComponent(stream.html,name,attachFile) }
}
