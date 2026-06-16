# Setting the Course, but Forgetting to Steer: Analyzing Compliance with GDPR's Right of Access to Data by Instagram, TikTok, and YouTube

Accepted at **IEEE S&P 2026**.

Sai Keerthana Karnam*, Abhisek Dash*, Antariksh Das, Sepehr Mousavi, Stefan Bechtold, Krishna P. Gummadi, Animesh Mukherjee, Ingmar Weber, Savvas Zannettou. [[Arxiv]](https://arxiv.org/abs/2502.11208)

---

## Abstract

The GDPR's Right of Access aims to empower users with control over their personal data via Data Download Packages (DDPs). However, their effectiveness is often compromised by inconsistent platform implementations, questionable data reliability, and poor user comprehensibility. This paper conducts a comprehensive audit of DDPs from three social media platforms (TikTok, Instagram, and YouTube) to systematically assess these critical drawbacks. Despite offering similar services, we find that these platforms demonstrate significant inconsistencies in implementing the Right of Access, evident in varying levels of shared data. Critically, the failure to disclose processing purposes, retention periods, and other third-party data recipients serves as a further indicator of non-compliance. Our reliability evaluations, using bots and user-donated data, reveal that while TikTok's DDPs offer more consistent and complete data, others exhibit notable shortcomings. Similarly, our assessment of comprehensibility, based on surveys with 400 participants, indicates that current DDPs substantially fall short of GDPR's standards.
To improve the comprehensibility, we propose and demonstrate a two-layered approach by: (1) enhancing the data representation itself using stakeholder interpretations; and (2) incorporating a user-friendly extension *Know Your Data* for intuitive data visualization where users can control the level of transparency they prefer. Our findings underscore the need for clearer and non-conflicting regulatory guidance, stricter enforcement, and platform commitment to realize the goal of GDPR's Right of Access.

![Pipeline](Pipeline.jpg)
**Figure 1 : Pipeline to evaluate comprehensibility and reliability of the implementation of Article 15(3) of the GDPR**.

---

## Folder Structure

```
GDPR_Compliance/
│
├── SURVEYS/        # Contains all survey setups.
│   ├── Survey(5)_Comprehensibility.pdf 
│   ├── Survey(5)_DDPs_used.zip
│   ├── Survey(6.1)_improved_DDPs_evaluation.pdf
│   ├── Survey(6.2)_Instagram.pdf
│   ├── Survey(6.2)_TikTok.pdf
│   ├── Survey(6.2)_YouTube.pdf
│
├── PROMPTS/
│   ├── LLM_Prompt_responses(6.1).pdf  # Include the Prompt and Responses from the LLM used for improving comprehensibility.
│
├── EXTENSION/   # Contains the source code for the browser extension developed as part of this project.
│
└── README.md
```

As part of this project, we built an extension to improve the comprehensibility of the DDPs.

- **Extension code:** `EXTENSION` folder
- **YouTube dashboard:** [Link](https://staging.d3h1wx5f2pab5i.amplifyapp.com/)

---

## Citation

```
@INPROCEEDINGS {,
author = { Karnam, Sai Keerthana and Dash, Abhisek and Das, Antariksh and Mousavi, Sepehr and Bechtold, Stefan and Gummadi, Krishna P. and Mukherjee, Animesh and Weber, Ingmar and Zannettou, Savvas },
booktitle = { 2026 IEEE Symposium on Security and Privacy (SP) },
title = {{ Setting the Course, but Forgetting to Steer: Analyzing Compliance with GDPR’s Right of Access to Data by Instagram, TikTok, and YouTube }},
year = {2026},
volume = {},
ISSN = {2375-1207},
pages = {1646-1664},
abstract = { The GDPR’s Right of Access aims to empower users with control over their personal data via Data Download Packages (DDPs). However, their effectiveness is often compromised by inconsistent platform implementations, questionable data reliability, and poor user comprehensibility. This paper conducts a comprehensive audit of DDPs from three social media platforms (TikTok, Instagram, and YouTube) to systematically assess these critical drawbacks. Despite offering similar services, we find that these platforms demonstrate significant inconsistencies in implementing the Right of Access, evident in varying levels of shared data. Critically, the failure to disclose processing purposes, retention periods, and other third-party data recipients serves as a further indicator of non-compliance. Our reliability evaluations, using bots and user-donated data, reveal that while TikTok’s DDPs offer more consistent and complete data, others exhibit notable shortcomings. Similarly, our assessment of comprehensibility, based on surveys with 400 participants, indicates that current DDPs substantially fall short of GDPR’s standards. To improve the comprehensibility, we propose and demonstrate a two-layered approach by: (1) enhancing the data representation itself using stakeholder interpretations; and (2) incorporating a user-friendly extension (Know Your Data) for intuitive data visualization where users can control the level of transparency they prefer. Our findings underscore the need for clearer and non-conflicting regulatory guidance, stricter enforcement, and platform commitment to realize the goal of GDPR’s Right of Access. },
keywords = {},
doi = {10.1109/SP63933.2026.00051},
url = {https://doi.ieeecomputersociety.org/10.1109/SP63933.2026.00051},
publisher = {IEEE Computer Society},
address = {Los Alamitos, CA, USA},
month =May}

```

## Contact

For any questions or issues, please contact: [saikeerthana00@gmail.com](mailto:saikeerthana00@gmail.com), [adash@mpi-sws.org](mailto:adash@mpi-sws.org)
