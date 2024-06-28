/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const mermaidStart =
  /^(\s*)(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|requirementDiagram|gitGraph|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|timeline)/gm;

export const isMermaidCode = (code: string): boolean => {
  if (code.startsWith('%%{init')) {
    const codeSplitByDirectiveStart = code.split('%%');

    if (codeSplitByDirectiveStart.length > 2)
      return code.split('%%')[2].match(mermaidStart) !== null;
  }

  return code.match(mermaidStart) !== null;
};
