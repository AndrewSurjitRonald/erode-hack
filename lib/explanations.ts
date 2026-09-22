export type MathSolution = {
  hint: string;
  steps: string[];
};

export function getHintAndExplanation(
  questionText: string,
  topicName: string,
  correctOption: string
): MathSolution {
  if (topicName === "Fractions") {
    return {
      hint: "Find a common denominator for both fractions before performing the operation.",
      steps: [
        "Identify the denominators of both fractions.",
        "Compute the Least Common Multiple (LCM) of the denominators to create equivalent fractions.",
        "Convert each fraction so they share the common denominator.",
        "Add, subtract, or multiply the numerators directly.",
        `Simplify the final fraction to lowest terms: ${correctOption}.`,
      ],
    };
  }

  if (topicName === "Ratios") {
    return {
      hint: "Set up a proportion: Write the ratio as a fraction a/b and set it equal to the known values.",
      steps: [
        "Express the given ratio relationship (e.g. boys : girls = a : b).",
        "Determine the multiplier: divide the known total by its corresponding ratio part.",
        "Multiply the target ratio part by the calculated multiplier.",
        `Verify and conclude the calculated quantity: ${correctOption}.`,
      ],
    };
  }

  if (topicName === "Linear Equations") {
    return {
      hint: "Isolate the variable term on one side of the equation by using inverse operations.",
      steps: [
        "Move constant terms to the opposite side of the equal sign by adding or subtracting.",
        "Combine like terms on both sides of the equation.",
        "Divide or multiply both sides by the coefficient of the variable to isolate it completely.",
        `Substitute the value back into the original equation to verify: ${correctOption}.`,
      ],
    };
  }

  if (topicName === "Percentages") {
    return {
      hint: "Remember that 'percent' means 'per 100'. Convert the percentage to a decimal or fraction first.",
      steps: [
        "Convert the percentage into a fraction with denominator 100 (e.g. P% = P/100).",
        "Multiply this fraction by the base amount or total quantity.",
        "Perform arithmetic operations (apply discounts or increases if applicable).",
        `Obtain the final evaluated value: ${correctOption}.`,
      ],
    };
  }

  return {
    hint: "Break the problem down into smaller parts and verify your units.",
    steps: [
      "Carefully read the question prompt and list known vs. unknown variables.",
      "Apply the fundamental formula corresponding to the topic.",
      `Carry out algebraic simplification to yield: ${correctOption}.`,
    ],
  };
}

export function detectCognitiveMisconception(
  topicName: string,
  selectedOption: string,
  correctOption: string
): string {
  if (topicName === "Fractions") {
    return "Cognitive Pattern Detected: You likely added or subtracted denominators directly without computing the Least Common Multiple (LCM). Denominators must be equalized first.";
  }

  if (topicName === "Linear Equations") {
    return "Cognitive Pattern Detected: Common Sign Inversion Error. When transposing a constant term across the equality sign (=), its algebraic sign must flip from positive to negative (or vice-versa).";
  }

  if (topicName === "Ratios") {
    return "Cognitive Pattern Detected: Ratio Part vs. Whole Confusion. The calculation treated a component share as the entire group total instead of setting up a proportional fraction.";
  }

  if (topicName === "Percentages") {
    return "Cognitive Pattern Detected: Base Reference Error. The percentage was evaluated against the new resulting quantity rather than the original baseline amount.";
  }

  return `Cognitive Pattern Detected: Arithmetic miscalculation between chosen answer (${selectedOption}) and target result (${correctOption}). Review intermediate simplification steps.`;
}
