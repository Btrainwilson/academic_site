# Build CV PDF with pdflatex (from this directory):
#   make
# From repo root:
#   make -C latex
#
# Build academic variant:
#   make academic
#
# Build both variants:
#   make all
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

.PHONY: all pdf academic clean distclean content content-academic

all: pdf academic

pdf: cv.pdf
	mkdir -p $(ROOT)/public
	cp cv.pdf $(ROOT)/public/cv.pdf

academic: cv-academic.pdf
	mkdir -p $(ROOT)/public
	cp cv-academic.pdf $(ROOT)/public/cv-academic.pdf

cv-content.tex: $(SCRIPT) $(JSON)
	node $(SCRIPT)

cv-content-academic.tex: $(SCRIPT) $(JSON)
	CV_VARIANT=academic node $(SCRIPT)

cv.pdf: cv.tex cv-content.tex
	$(PDFLATEX) $(LATEX_FLAGS) cv.tex
	$(PDFLATEX) $(LATEX_FLAGS) cv.tex

cv-academic.pdf: cv-academic.tex cv-content-academic.tex
	$(PDFLATEX) $(LATEX_FLAGS) cv-academic.tex
	$(PDFLATEX) $(LATEX_FLAGS) cv-academic.tex

content: cv-content.tex

content-academic: cv-content-academic.tex

clean:
	rm -f *.aux *.log *.out *.toc *.synctex.gz *.fdb_latexmk *.fls

distclean: clean
	rm -f cv.pdf cv-academic.pdf
