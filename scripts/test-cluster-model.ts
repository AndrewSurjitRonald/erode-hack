import { assignArchetype } from "../lib/ml/cluster-model";

console.log(
  'assignArchetype([0.9,0.9,0.9,0.9]) =',
  assignArchetype([0.9, 0.9, 0.9, 0.9]),
  "(expect On Track)"
);
console.log(
  'assignArchetype([0.1,0.1,0.1,0.1]) =',
  assignArchetype([0.1, 0.1, 0.1, 0.1]),
  "(expect Needs Support)"
);
console.log(
  'assignArchetype([0.9,0.1,0.9,0.1]) =',
  assignArchetype([0.9, 0.1, 0.9, 0.1]),
  "(expect Uneven)"
);
