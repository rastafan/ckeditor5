import HtmlComment from '../src/htmlcomment';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'HTMLComment', () => {
	let editor;
	let htmlCommentPlugin;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, HtmlComment ]
		} );

		htmlCommentPlugin = editor.plugins.get( HtmlComment );
	} );

	describe( 'createHtmlComment()', () => {
		it( 'should create an HTML comment between elements', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				htmlCommentPlugin.createHtmlComment( position, 'first' );
			} );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--first--><p>Bar</p><p>Baz</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 2 );

				htmlCommentPlugin.createHtmlComment( position, 'second' );
			} );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--first--><p>Bar</p><!--second--><p>Baz</p>' );
		} );

		it( 'should return a comment ID of the comment', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const firstCommentID = editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlCommentPlugin.createHtmlComment( position, 'foo' );
			} );

			const secondCommentID = editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlCommentPlugin.createHtmlComment( position, 'bar' );
			} );

			expect( firstCommentID ).to.be.a( 'string' );
			expect( secondCommentID ).to.be.a( 'string' );

			expect( firstCommentID ).to.not.equal( secondCommentID );
		} );

		it( 'should create a marker at the given position constructed with the comment ID', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				htmlCommentPlugin.createHtmlComment( position, 'foo' );
			} );
		} );

		it( 'should specify the ID for the created comment if the 3rd argument is passed', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const firstCommentID = editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlCommentPlugin.createHtmlComment( position, 'foo', 'comment-id-1' );
			} );

			expect( firstCommentID ).to.equal( 'comment-id-1' );
		} );

		it( 'should allow creating an HTML comment inside the text', () => {
			editor.setData( '<p>Foo</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root.getChild( 0 ), 1 );

				htmlCommentPlugin.createHtmlComment( position, 'foo' );
			} );

			expect( editor.getData() ).to.equal( '<p>F<!--foo-->oo</p>' );
		} );

		it( 'should allow creating a few HTML comments in the same place', () => {
			editor.setData( '<p>Foo</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root.getChild( 0 ), 1 );

				htmlCommentPlugin.createHtmlComment( position, 'foo' );
				htmlCommentPlugin.createHtmlComment( position, 'bar' );
			} );

			expect( editor.getData() ).to.equal( '<p>F<!--bar--><!--foo-->oo</p>' );
		} );

		it( 'should allow creating an HTML comment before the first element', () => {
			editor.setData( '<p>Foo</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 0 );

				htmlCommentPlugin.createHtmlComment( position, 'foo' );
			} );

			expect( editor.getData() ).to.equal( '<!--foo--><p>Foo</p>' );
		} );

		it( 'should allow creating an HTML comment after the last element', () => {
			editor.setData( '<p>Foo</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				htmlCommentPlugin.createHtmlComment( position, 'foo' );
			} );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--foo-->' );
		} );
	} );

	describe( 'removeHtmlComment()', () => {
		it( 'should allow removing a comment with the given comment ID', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			const firstCommentID = editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlCommentPlugin.createHtmlComment( position, 'foo' );
			} );

			const secondCommentID = editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlCommentPlugin.createHtmlComment( position, 'bar' );
			} );

			htmlCommentPlugin.removeHtmlComment( firstCommentID );

			expect( editor.getData() ).to.equal( '<p>Foo</p><!--bar--><p>Bar</p><p>Baz</p>' );

			htmlCommentPlugin.removeHtmlComment( secondCommentID );

			expect( editor.getData() ).to.equal( '<p>Foo</p><p>Bar</p><p>Baz</p>' );
		} );

		it( 'should throw an error when a comment with the given comment ID does not exist', () => {
			editor.setData( '<p>Foo</p><p>Bar</p><p>Baz</p>' );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlCommentPlugin.createHtmlComment( position, 'foo', 'first' );
			} );

			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const position = writer.createPositionAt( root, 1 );

				return htmlCommentPlugin.createHtmlComment( position, 'bar', 'second' );
			} );

			expectToThrowCKEditorError( () => {
				htmlCommentPlugin.removeHtmlComment( 'third' );
			}, /^html-comment-does-not-exist/, null );
		} );
	} );
} );
