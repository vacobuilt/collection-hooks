// Configure @testing-library/react-hooks to use react-test-renderer
const { configure } = require('@testing-library/react-hooks');
const reactTestRenderer = require('react-test-renderer');

configure({ renderer: reactTestRenderer.create });
