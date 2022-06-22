# α-diversities

GMHI-webtool computes the following α-diversities:

## Richness
Let $p_i$ be the relative abundance of the ith species in the sample.
For consistency with the original GMHI work, only the 313 species considered by Gupta et al. were considered.
Let $c = 0.00001$ be the presence threshold.
Richness R is the number of species in the sample where $p_i > c$.

## Shannon Diversity
Shannon diversity $H' = \sum_{i=1}^{R}p_i ln(p_i)$.

## Evenness

Let $S$ = the total number of possible species (313). 
That is, $S$ = the max possible richness R.
Evenness $E = \frac{H'}{ln(S)}$.

## Inverse Simpson Diversity

Inverse Simpson $I = \frac{1}{\sum_{i=1}^{R}ln(p_i)}$
