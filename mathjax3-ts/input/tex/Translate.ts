/*************************************************************
 *
 *  MathJax/jax/input/TeX/Translate.js
 *
 *  Implements the TeX InputJax that reads mathematics in
 *  TeX and LaTeX format and converts it to the MML ElementJax
 *  internal format.
 *
 *  ---------------------------------------------------------------------
 *
 *  Copyright (c) 2009-2017 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {TreeHelper} from './TreeHelper.js';
import {OldParser} from './OldParser.js';
import {ParserUtil} from './ParserUtil.js';
// import {ParseMethods} from './ParseMethods.js';
import {ParseMethods} from './ParseMethods.js';
import TexError from './TexError.js';
import {MmlNode} from '../../core/MmlTree/MmlNode.js';

// A wrapper for translating scripts with LaTeX content.

export type Script = {type: string, innerText: string, MathJax: any};

let formatError = function (err: TexError, math: string, display: boolean, script: Script) {
  var message = err.message.replace(/\n.*/,"");
  return TreeHelper.createError(message);
};


export default function Translate(script: Script, configurations: string[] = [],
                                  stackitem?: any) {
  TreeHelper.printMethod('Translate');
  TreeHelper.printSimple(script.toString());
  let mml: MmlNode;
  let isError = false;
  let math = script.innerText;
  let display = (script.type.replace(/\n/g," ").match(/(;|\s|\n)mode\s*=\s*display(;|\s|\n|$)/) != null);
  try {
    mml = new OldParser(math, null, ParseMethods as any).mml();
    TreeHelper.printSimple(mml.toString());
  } catch(err) {
    if (!(err instanceof TexError)) {throw err}
    mml = formatError(err, math, display, script);
    isError = true;
  }
  mml = TreeHelper.cleanSubSup(mml);
  if (TreeHelper.isType(mml, 'mtable') &&
      TreeHelper.getAttribute(mml, 'displaystyle') === 'inherit') {
    // for tagged equations
    TreeHelper.untested('Tagged equations');
    TreeHelper.setAttribute(mml, 'displaystyle', display);
  }
  let mathNode = TreeHelper.createMath(mml);
  let root = TreeHelper.getRoot(mathNode);
  if (display) {
    TreeHelper.setAttribute(root, 'display', 'block');
  }
  // TODO: Should not be necessary anymore!
  // if (isError) {
  //   (mathNode as any).texError = true;
  // }
  ParserUtil.combineRelations(root);
  return mathNode;
};
