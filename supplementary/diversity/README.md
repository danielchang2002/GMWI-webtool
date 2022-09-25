# α-diversities

GMHI-webtool computes the following α-diversities:

## Richness
Let $p_i$ be the relative abundance of the $i$<SUP>th</SUP> species in the sample.
For consistency with the original GMHI work, only the 313 species considered by Gupta et al. were considered.
Let $c = 0.00001$ be the presence threshold.
Richness R is the number of species with relative abundance greater than the presence threshold:

$$R = \sum_{\forall i}[p_i > c]$$

## Shannon Diversity
Shannon diversity $H'$:

$$H' = -\sum_{i=1}^{R}p_i ln(p_i)$$

## Evenness
Let $S$ = the total possible number of species in a sample (313).
Evenness E is defined as:
$$E = \frac{H'}{ln(S)}$$

## Inverse Simpson Diversity

Simpson Diversity $\lambda$:
$$\lambda = \sum_{i=1}^{R} ln(p_i)$$

Inverse Simpson $I$:
$$I = \frac{1}{\lambda}$$
