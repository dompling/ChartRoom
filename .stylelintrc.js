module.exports = {
  extends: require.resolve('@umijs/max/stylelint'),
  rules: {
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'no-duplicate-selectors': null,
    'plugin/declaration-block-no-ignored-properties': null,
    'function-no-unknown': null,
    'property-no-unknown': null,
  },
};
