# α-diversities

GMHI-webtool computes the following α-diversities:

## Richness
Let $p_i$ be the relative abundance of the $i$<SUP>th</SUP> species in the sample.
To be consistent with the [original GMHI study](https://www.nature.com/articles/s41467-020-18476-8), only the 313 species considered by Gupta *et al*. were considered.
Let a relative abundance of $c = 0.00001$ be the presence threshold.
Richness R is the number of species with relative abundance greater than the presence threshold:

$$R = \sum_{\forall i}[p_i > c]$$

## Shannon Diversity
Shannon diversity $H'$:

$$H' = -\sum_{i=1}^{R}p_i ln(p_i)$$

## Evenness
Let $S$ be the total possible number of species in a sample (313).
Evenness E is defined as:
$$E = \frac{H'}{ln(S)}$$

## Inverse Simpson Diversity

Simpson Diversity $\lambda$:
$$\lambda = \sum_{i=1}^{R} ln(p_i)$$

Inverse Simpson $I$:
$$I = \frac{1}{\lambda}$$
