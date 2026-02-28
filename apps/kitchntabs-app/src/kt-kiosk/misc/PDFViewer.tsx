import React, { FC, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

import PDFPagination from './PDFPagination';

// Configure PDF.js worker using CDN for cross-browser compatibility
// The local import approach fails on Firefox/Android due to MIME type issues
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface IPDFViewer {
    file: string;
}

const PDFViewer: FC<IPDFViewer> = (props) => {
    const { file } = props;

    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
        setNumPages(numPages);
    };

    return (
        <div className='content-pdf'>
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading="..."
                error="Error al cargar el PDF"
                zoom={2}
            >
                <Page
                    pageNumber={pageNumber}
                    loading="..."
                    error="Error al cargar la página"
                />
            </Document>

            <div className='content-pdf-pagination'>
                {numPages && (
                    <PDFPagination
                        currentPage={pageNumber}
                        onPageNavigate={(pageNum: number) => setPageNumber(pageNum)}
                        maxPage={numPages}
                    />
                )}
                <div className='content-pdf-pagination-info'>
                    {numPages && <p> Página {pageNumber} de {numPages} </p>}
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;
