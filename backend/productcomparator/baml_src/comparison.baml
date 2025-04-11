class ProductComparison {
  bestProduct string
  bestProductReason string
}


function CompareAnalysis(analysis: string) -> ProductComparison {
  client  "openai/gpt-4o-mini"
    prompt #"
    Compare the following product analysis texts:
    {{ analysis }}

    Based on each product's analysis, compare all products and deduct which one is the best and why. Focus on the categories it excels in, its price compared to the others, and the advantages it has over the others.
    Base the choice of the best product on both the average of all category scores and its price. Make sure to mention all products in the analysis.
    
    {{ ctx.output_format }}
  "#
}
