import HtmlComment from '../src/htmlcomment';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'HTMLComment', () => {
	let editor;
	let htmlComment;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, HtmlComment ]
		} );

		htmlComment = editor.plugins.get( HtmlComment );
	} );

	describe( 'createHtmlComment()', () => {
		it( 'should allow creating an HTML comment between elements', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				htmlComment.createHtmlComment( position, 'first' );
			} );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--first--><p>Bar</p><p>Baz</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 2 );

				htmlComment.createHtmlComment( position, 'second' );
			} );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--first--><p>Bar</p><!--second--><p>Baz</p>' );
		} );

		it( 'should return a comment ID of the comment', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const firstCommentID = editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlComment.createHtmlComment( position, 'foo' );
			} );

			const secondCommentID = editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlComment.createHtmlComment( position, 'foo' );
			} );

			expect( firstCommentID ).to.be.a( 'string' );
			expect( secondCommentID ).to.be.a( 'string' );

			expect( firstCommentID ).to.not.equal( secondCommentID );
		} );

		it( 'should allow specifying the ID for the created comment', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const firstCommentID = editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlComment.createHtmlComment( position, 'foo', 'comment-id-1' );
			} );

			expect( firstCommentID ).to.equal( 'comment-id-1' );
		} );

		it( 'should allow creating an HTML comment inside the text', () => {
			editor.setData( '<p>Foo</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root.getChild( 0 ), 1 );

				htmlComment.createHtmlComment( position, 'foo' );
			} );

			expect( editor.getData() ).to.equal( '<p>F<!--foo-->oo</p>' );
		} );

		it( 'should allow creating a few HTML comments in the same place', () => {
			editor.setData( '<p>Foo</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root.getChild( 0 ), 1 );

				htmlComment.createHtmlComment( position, 'foo' );
				htmlComment.createHtmlComment( position, 'bar' );
			} );

			expect( editor.getData() ).to.equal( '<p>F<!--bar--><!--foo-->oo</p>' );
		} );

		it( 'should allow creating an HTML comment before the first element', () => {
			editor.setData( '<p>Foo</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 0 );

				htmlComment.createHtmlComment( position, 'foo' );
			} );

			expect( editor.getData() ).to.equal( '<!--foo--><p>Foo</p>' );
		} );

		it( 'should allow creating an HTML comment after the last element', () => {
			editor.setData( '<p>Foo</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				htmlComment.createHtmlComment( position, 'foo' );
			} );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--foo-->' );
		} );
	} );
} );
