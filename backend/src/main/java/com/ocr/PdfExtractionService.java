package com.aiepaper.ocr;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
public class PdfExtractionService {

    public String extractText(String filePath)
            throws IOException {

        File file = new File(filePath);

        PDDocument document =
                Loader.loadPDF(file);

        String text =
                new org.apache.pdfbox.text.PDFTextStripper()
                        .getText(document);

        document.close();

        return text;
    }
}