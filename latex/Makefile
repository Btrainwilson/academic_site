# Build CV PDF with pdflatex (from this directory):
#   make
# From repo root:
#   make -C latex
#
# Full site PDF set (CV + research + teaching statements) uses the Node orchestrator:
#   npm run cv:pdf
#
# Regenerate cv-content.tex from JSON without building PDF:
#   make content

PDFLATEX := pdflatex
LATEX_FLAGS := -interaction=nonstopmode -file-line-error

ROOT := ..
SCRIPT := $(ROOT)/scripts/cv-to-latex.mjs
JSON := $(wildcard $(ROOT)/src/data/cv/*.json)

.PHONY: all pdf clean distclean content

all: pdf

pdf: cv.pdf
	mkdir -p $(ROOT)/public
	cp cv.pdf $(ROOT)/public/cv.pdf

cv-content.tex: $(SCRIPT) $(JSON)
	node $(SCRIPT)

cv.pdf: cv.tex cv-content.tex
	$(PDFLATEX) $(LATEX_FLAGS) cv.tex
	$(PDFLATEX) $(LATEX_FLAGS) cv.tex

content: cv-content.tex

clean:
	rm -f *.aux *.log *.out *.toc *.synctex.gz *.fdb_latexmk *.fls

distclean: clean
	rm -f cv.pdf
