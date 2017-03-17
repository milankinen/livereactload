import ExecutionEnvironment from 'fbjs/lib/ExecutionEnvironment';
import {jsdom} from 'jsdom';

global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = global.document.defaultView;
global.navigator = global.window.navigator;

export default function jsdomReact() {
  ExecutionEnvironment.canUseDOM = true;
}
