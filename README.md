# [GMHI Webtool](https://danielchang2002.github.io/GMHI) 💩

[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![D3][d3]][d3-url]

## Description

A [user-friendly tool](https://danielchang2002.github.io/GMHI) for assessing health through metagenomic gut microbiome profiling


## Usage

1. Run [MetaPhlAn2](https://github.com/biobakery/MetaPhlAn2) on your metagenome .fastq file(s)

```bash
metaphlan2 metagenome_1.fastq --input_type fastq -o profiled_metagenome_1.txt
metaphlan2 metagenome_2.fastq --input_type fastq -o profiled_metagenome_2.txt
...
metaphlan2 metagenome_n.fastq --input_type fastq -o profiled_metagenome_n.txt
```

2. Merge outputs (if multiple) into a single file

```bash
merge_metaphlan_tables.py profiled_metagenome*.txt > merged_abundance_table.txt
```

3. Upload (merged) MetaPhlAn2 output to [GMHI-webtool](https://danielchang2002.github.io/GMHI/)

4. Profit 🤑

<!-- MARKDOWN LINKS & IMAGES -->
[forks-shield]: https://img.shields.io/github/forks/danielchang2002/GMHI.svg?style=for-the-badge
[forks-url]: https://github.com/danielchang2002/GMHI/network/members
[stars-shield]: https://img.shields.io/github/stars/danielchang2002/GMHI.svg?style=for-the-badge
[stars-url]: https://github.com/danielchang2002/GMHI/stargazers
[issues-shield]: https://img.shields.io/github/issues/danielchang2002/GMHI.svg?style=for-the-badge
[issues-url]: https://github.com/danielchang2002/GMHI/issues
[license-shield]: https://img.shields.io/github/license/danielchang2002/GMHI.svg?style=for-the-badge
[license-url]: https://github.com/danielchang2002/GMHI/blob/main/LICENSE
[d3]: https://img.shields.io/badge/d3.js-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white
[d3-url]: https://d3js.org/
[upload-box]: images/upload.png
